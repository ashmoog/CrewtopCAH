import { db } from "./db";
import {
  users,
  cards,
  games,
  players,
  hands,
  playedCards,
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
  createGame(guildId: string, channelId: string): Promise<Game>;
  getGame(channelId: string): Promise<Game | undefined>;
  updateGameStatus(gameId: number, status: string): Promise<Game>;
  setGameJudge(gameId: number, judgeId: string): Promise<Game>;
  setGameBlackCard(gameId: number, cardId: number): Promise<Game>;
  endGame(gameId: number): Promise<void>;

  // Players
  addPlayer(gameId: number, userId: string, username: string, isVip?: boolean): Promise<Player>;
  getPlayer(gameId: number, userId: string): Promise<Player | undefined>;
  getPlayers(gameId: number): Promise<Player[]>;
  removePlayer(gameId: number, userId: string): Promise<void>;
  incrementScore(playerId: number): Promise<Player>;

  // Hands
  addToHand(playerId: number, cardId: number): Promise<void>;
  getHand(playerId: number): Promise<(Card & { handId: number })[]>;
  removeFromHand(playerId: number, cardId: number): Promise<void>;

  // Gameplay
  playCard(gameId: number, playerId: number, cardId: number): Promise<void>;
  getPlayedCards(gameId: number): Promise<(Card & { playerId: number; username: string })[]>;
  clearPlayedCards(gameId: number): Promise<void>;
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
    const existing = await db.select().from(cards).limit(1);
    if (existing.length === 0) {
      await db.insert(cards).values(initialCards);
    }
  }

  async getWhiteCards(limit: number, excludeIds: number[] = []): Promise<Card[]> {
    let query = db.select().from(cards).where(eq(cards.type, "white"));
    if (excludeIds.length > 0) {
      query = query.where(and(eq(cards.type, "white"), notInArray(cards.id, excludeIds)));
    }
    // Random sort
    return await query.orderBy(sql`RANDOM()`).limit(limit);
  }

  async getBlackCard(excludeIds: number[] = []): Promise<Card | undefined> {
    let query = db.select().from(cards).where(eq(cards.type, "black"));
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

  async createGame(guildId: string, channelId: string): Promise<Game> {
    const [game] = await db.insert(games).values({
      guildId,
      channelId,
      status: "waiting",
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

  async updateGameStatus(gameId: number, status: string): Promise<Game> {
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
    return await db.select().from(players).where(eq(players.gameId, gameId));
  }

  async removePlayer(gameId: number, userId: string): Promise<void> {
    await db.delete(players).where(and(eq(players.gameId, gameId), eq(players.userId, userId)));
  }

  async incrementScore(playerId: number): Promise<Player> {
    const [player] = await db.update(players)
      .set({ score: sql`score + 1` })
      .where(eq(players.id, playerId))
      .returning();
    return player;
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
    .where(eq(hands.playerId, playerId));
  }

  async removeFromHand(playerId: number, cardId: number): Promise<void> {
    await db.delete(hands).where(and(eq(hands.playerId, playerId), eq(hands.cardId, cardId)));
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
    .where(eq(playedCards.gameId, gameId));
  }

  async clearPlayedCards(gameId: number): Promise<void> {
    await db.delete(playedCards).where(eq(playedCards.gameId, gameId));
  }
}

export const storage = new DatabaseStorage();
