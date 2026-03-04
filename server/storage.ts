import { db } from "./db";
import {
  cards,
  games,
  players,
  hands,
  playedCards,
  usedCards,
  type Card,
  type Game,
  type Player,
} from "@shared/schema";
import { eq, and, notInArray, sql } from "drizzle-orm";
import { initialCards } from "./cards_data";

export interface IStorage {
  // Stats
  getStats(): Promise<{ activeGames: number; totalPlayers: number; totalCards: number }>;

  // Cards
  seedCards(): Promise<void>;
  getWhiteCards(limit: number, excludeIds?: number[]): Promise<Card[]>;
  getBlackCard(excludeIds?: number[]): Promise<Card | undefined>;
  getCard(id: number): Promise<Card | undefined>;

  // Game
  createGame(guildId: string, channelId: string, pointsToWin?: number): Promise<Game>;
  getGame(channelId: string): Promise<Game | undefined>;
  updateGameStatus(gameId: number, status: string): Promise<Game>;
  setGameJudge(gameId: number, judgeId: string): Promise<Game>;
  setGameBlackCard(gameId: number, cardId: number): Promise<Game>;
  endGame(gameId: number): Promise<void>;
  deleteGame(gameId: number): Promise<void>;

  // Players
  addPlayer(gameId: number, userId: string, username: string, isVip?: boolean): Promise<Player>;
  getPlayer(gameId: number, userId: string): Promise<Player | undefined>;
  getPlayers(gameId: number): Promise<Player[]>;
  removePlayer(gameId: number, userId: string): Promise<void>;
  removePlayerData(playerId: number): Promise<void>;
  incrementScore(playerId: number): Promise<Player>;

  // Hands
  getAllHandCardIds(gameId: number): Promise<number[]>;
  addToHand(playerId: number, cardId: number): Promise<void>;
  getHand(playerId: number): Promise<(Card & { handId: number })[]>;
  removeFromHand(playerId: number, cardId: number): Promise<void>;

  // Gameplay
  playCard(gameId: number, playerId: number, cardId: number): Promise<void>;
  getPlayedCards(gameId: number): Promise<(Card & { playerId: number; username: string })[]>;
  getPlayedCardIds(gameId: number): Promise<number[]>;
  clearPlayedCards(gameId: number): Promise<void>;
  removePlayedCardsFromHands(gameId: number): Promise<void>;

  // Used cards (finite deck tracking)
  markCardUsed(gameId: number, cardId: number, cardType: "black" | "white"): Promise<void>;
  markCardsUsed(gameId: number, cardIds: number[], cardType: "black" | "white"): Promise<void>;
  getUsedCardIds(gameId: number, cardType: "black" | "white"): Promise<number[]>;
  clearUsedCards(gameId: number, cardType?: "black" | "white"): Promise<void>;
  getWhiteCardsExcludingUsed(gameId: number, limit: number, extraExcludeIds?: number[]): Promise<Card[]>;
  getBlackCardExcludingUsed(gameId: number): Promise<Card | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getStats() {
    const [gameCount] = await db.select({ count: sql<number>`count(*)` }).from(games).where(eq(games.status, "playing"));
    const [playerCount] = await db.select({ count: sql<number>`count(*)` }).from(players);
    const [cardCount] = await db.select({ count: sql<number>`count(*)` }).from(cards);
    return {
      activeGames: Number(gameCount?.count || 0),
      totalPlayers: Number(playerCount?.count || 0),
      totalCards: Number(cardCount?.count || 0),
    };
  }

  async seedCards() {
    const [cardCount] = await db.select({ count: sql<number>`count(*)` }).from(cards);
    if (Number(cardCount?.count || 0) < initialCards.length) {
      await db.delete(playedCards);
      await db.delete(hands);
      await db.delete(players);
      await db.delete(games);
      await db.delete(cards);
      await db.insert(cards).values(initialCards as any);
    }
  }

  async getWhiteCards(limit: number, excludeIds: number[] = []): Promise<Card[]> {
    let query = db.select().from(cards).where(eq(cards.type, "white")).$dynamic();
    if (excludeIds.length > 0) {
      query = query.where(and(eq(cards.type, "white"), notInArray(cards.id, excludeIds)));
    }
    return await query.orderBy(sql`RANDOM()`).limit(limit);
  }

  async getBlackCard(excludeIds: number[] = []): Promise<Card | undefined> {
    let query = db.select().from(cards).where(eq(cards.type, "black")).$dynamic();
    if (excludeIds.length > 0) {
      query = query.where(and(eq(cards.type, "black"), notInArray(cards.id, excludeIds)));
    }
    const [card] = await query.orderBy(sql`RANDOM()`).limit(1);
    return card;
  }

  async getCard(id: number): Promise<Card | undefined> {
    const [card] = await db.select().from(cards).where(eq(cards.id, id));
    return card;
  }

  async createGame(guildId: string, channelId: string, pointsToWin: number = 5): Promise<Game> {
    const [game] = await db.insert(games).values({
      guildId,
      channelId,
      status: "waiting",
      pointsToWin,
    }).returning();
    return game;
  }

  async getGame(channelId: string): Promise<Game | undefined> {
    const [game] = await db.select().from(games)
      .where(and(eq(games.channelId, channelId), sql`status != 'finished'`))
      .orderBy(sql`${games.createdAt} DESC`)
      .limit(1);
    return game;
  }

  async updateGameStatus(gameId: number, status: "waiting" | "playing" | "judging" | "finished"): Promise<Game> {
    const [game] = await db.update(games).set({ status }).where(eq(games.id, gameId)).returning();
    return game;
  }

  async setGameJudge(gameId: number, judgeId: string): Promise<Game> {
    const [game] = await db.update(games).set({ judgeId }).where(eq(games.id, gameId)).returning();
    return game;
  }

  async setGameBlackCard(gameId: number, cardId: number): Promise<Game> {
    const [game] = await db.update(games).set({ currentBlackCardId: cardId }).where(eq(games.id, gameId)).returning();
    return game;
  }

  async endGame(gameId: number): Promise<void> {
    await db.update(games).set({ status: "finished" }).where(eq(games.id, gameId));
  }

  async deleteGame(gameId: number): Promise<void> {
    await db.delete(usedCards).where(eq(usedCards.gameId, gameId));
    await db.delete(playedCards).where(eq(playedCards.gameId, gameId));
    const gamePlayers = await db.select().from(players).where(eq(players.gameId, gameId));
    for (const p of gamePlayers) {
      await db.delete(hands).where(eq(hands.playerId, p.id));
    }
    await db.delete(players).where(eq(players.gameId, gameId));
    await db.delete(games).where(eq(games.id, gameId));
  }

  async addPlayer(gameId: number, userId: string, username: string, isVip = false): Promise<Player> {
    const [player] = await db.insert(players).values({
      gameId,
      userId,
      username,
      isVip,
    }).returning();
    return player;
  }

  async getPlayer(gameId: number, userId: string): Promise<Player | undefined> {
    const [player] = await db.select().from(players).where(and(eq(players.gameId, gameId), eq(players.userId, userId)));
    return player;
  }

  async getPlayers(gameId: number): Promise<Player[]> {
    return await db.select().from(players).where(eq(players.gameId, gameId)).orderBy(players.id);
  }

  async removePlayer(gameId: number, userId: string): Promise<void> {
    const player = await this.getPlayer(gameId, userId);
    if (player) {
      await this.removePlayerData(player.id);
    }
    await db.delete(players).where(and(eq(players.gameId, gameId), eq(players.userId, userId)));
  }

  async removePlayerData(playerId: number): Promise<void> {
    await db.delete(hands).where(eq(hands.playerId, playerId));
    await db.delete(playedCards).where(eq(playedCards.playerId, playerId));
  }

  async incrementScore(playerId: number): Promise<Player> {
    const [player] = await db.update(players)
      .set({ score: sql`score + 1` })
      .where(eq(players.id, playerId))
      .returning();
    return player;
  }

  async getAllHandCardIds(gameId: number): Promise<number[]> {
    const result = await db.select({ cardId: hands.cardId })
      .from(hands)
      .innerJoin(players, eq(hands.playerId, players.id))
      .where(eq(players.gameId, gameId));
    return result.map(r => r.cardId);
  }

  async addToHand(playerId: number, cardId: number): Promise<void> {
    await db.insert(hands).values({ playerId, cardId });
  }

  async getHand(playerId: number): Promise<(Card & { handId: number })[]> {
    return await db.select({
      id: cards.id,
      text: cards.text,
      type: cards.type,
      pick: cards.pick,
      pack: cards.pack,
      handId: hands.id,
    })
    .from(hands)
    .innerJoin(cards, eq(hands.cardId, cards.id))
    .where(eq(hands.playerId, playerId))
    .orderBy(hands.id);
  }

  async removeFromHand(playerId: number, cardId: number): Promise<void> {
    // We only want to remove one instance of the card if duplicates exist (though rare in CAH)
    const [item] = await db.select().from(hands)
      .where(and(eq(hands.playerId, playerId), eq(hands.cardId, cardId)))
      .limit(1);
    
    if (item) {
      await db.delete(hands).where(eq(hands.id, item.id));
    }
  }

  async playCard(gameId: number, playerId: number, cardId: number): Promise<void> {
    await db.insert(playedCards).values({ gameId, playerId, cardId });
  }

  async getPlayedCards(gameId: number): Promise<(Card & { playerId: number; username: string })[]> {
    return await db.select({
      id: cards.id,
      text: cards.text,
      type: cards.type,
      pick: cards.pick,
      pack: cards.pack,
      playerId: players.id,
      username: players.username,
    })
    .from(playedCards)
    .innerJoin(cards, eq(playedCards.cardId, cards.id))
    .innerJoin(players, eq(playedCards.playerId, players.id))
    .where(eq(playedCards.gameId, gameId))
    .orderBy(playedCards.id);
  }

  async clearPlayedCards(gameId: number): Promise<void> {
    await db.delete(playedCards).where(eq(playedCards.gameId, gameId));
  }

  async removePlayedCardsFromHands(gameId: number): Promise<void> {
    const played = await db.select({ playerId: playedCards.playerId, cardId: playedCards.cardId })
      .from(playedCards)
      .where(eq(playedCards.gameId, gameId));

    for (const pc of played) {
      const [item] = await db.select().from(hands)
        .where(and(eq(hands.playerId, pc.playerId), eq(hands.cardId, pc.cardId)))
        .limit(1);
      if (item) {
        await db.delete(hands).where(eq(hands.id, item.id));
      }
    }
  }

  async markCardUsed(gameId: number, cardId: number, cardType: "black" | "white"): Promise<void> {
    await db.insert(usedCards).values({ gameId, cardId, cardType });
  }

  async markCardsUsed(gameId: number, cardIds: number[], cardType: "black" | "white"): Promise<void> {
    if (cardIds.length === 0) return;
    await db.insert(usedCards).values(cardIds.map(cardId => ({ gameId, cardId, cardType })));
  }

  async getUsedCardIds(gameId: number, cardType: "black" | "white"): Promise<number[]> {
    const result = await db.select({ cardId: usedCards.cardId })
      .from(usedCards)
      .where(and(eq(usedCards.gameId, gameId), eq(usedCards.cardType, cardType)));
    return result.map(r => r.cardId);
  }

  async clearUsedCards(gameId: number, cardType?: "black" | "white"): Promise<void> {
    if (cardType) {
      await db.delete(usedCards).where(and(eq(usedCards.gameId, gameId), eq(usedCards.cardType, cardType)));
    } else {
      await db.delete(usedCards).where(eq(usedCards.gameId, gameId));
    }
  }

  async getPlayedCardIds(gameId: number): Promise<number[]> {
    const result = await db.select({ cardId: playedCards.cardId })
      .from(playedCards)
      .where(eq(playedCards.gameId, gameId));
    return result.map(r => r.cardId);
  }

  async getWhiteCardsExcludingUsed(gameId: number, limit: number, extraExcludeIds: number[] = []): Promise<Card[]> {
    const usedIds = await this.getUsedCardIds(gameId, "white");
    const handIds = await this.getAllHandCardIds(gameId);
    const playedIds = await this.getPlayedCardIds(gameId);
    const allExclude = [...new Set([...usedIds, ...handIds, ...playedIds, ...extraExcludeIds])];

    let result: Card[];
    if (allExclude.length > 0) {
      result = await db.select().from(cards)
        .where(and(eq(cards.type, "white"), notInArray(cards.id, allExclude)))
        .orderBy(sql`RANDOM()`)
        .limit(limit);
    } else {
      result = await db.select().from(cards)
        .where(eq(cards.type, "white"))
        .orderBy(sql`RANDOM()`)
        .limit(limit);
    }

    if (result.length < limit) {
      await this.clearUsedCards(gameId, "white");
      const currentHandIds = await this.getAllHandCardIds(gameId);
      const currentPlayedIds = await this.getPlayedCardIds(gameId);
      const stillExclude = [...new Set([...currentHandIds, ...currentPlayedIds, ...extraExcludeIds, ...result.map(c => c.id)])];

      const remaining = limit - result.length;
      let moreCards: Card[];
      if (stillExclude.length > 0) {
        moreCards = await db.select().from(cards)
          .where(and(eq(cards.type, "white"), notInArray(cards.id, stillExclude)))
          .orderBy(sql`RANDOM()`)
          .limit(remaining);
      } else {
        moreCards = await db.select().from(cards)
          .where(eq(cards.type, "white"))
          .orderBy(sql`RANDOM()`)
          .limit(remaining);
      }
      result = [...result, ...moreCards];
    }

    return result;
  }

  async getBlackCardExcludingUsed(gameId: number): Promise<Card | undefined> {
    const usedIds = await this.getUsedCardIds(gameId, "black");

    let result: Card | undefined;
    if (usedIds.length > 0) {
      const [card] = await db.select().from(cards)
        .where(and(eq(cards.type, "black"), notInArray(cards.id, usedIds)))
        .orderBy(sql`RANDOM()`)
        .limit(1);
      result = card;
    } else {
      const [card] = await db.select().from(cards)
        .where(eq(cards.type, "black"))
        .orderBy(sql`RANDOM()`)
        .limit(1);
      result = card;
    }

    if (!result) {
      await this.clearUsedCards(gameId, "black");
      const [card] = await db.select().from(cards)
        .where(eq(cards.type, "black"))
        .orderBy(sql`RANDOM()`)
        .limit(1);
      result = card;
    }

    return result;
  }
}

export const storage = new DatabaseStorage();
