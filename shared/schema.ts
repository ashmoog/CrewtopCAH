import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

// Stores the available cards
export const cards = pgTable("cards", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  type: text("type", { enum: ["black", "white"] }).notNull(), // 'black' (question) or 'white' (answer)
  pick: integer("pick").default(1), // How many cards to pick (only for black cards)
  pack: text("pack").default("base"), // Expansion pack name
});

// Active games
export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  guildId: text("guild_id").notNull(), // Discord Server ID
  channelId: text("channel_id").notNull(), // Discord Channel ID
  status: text("status", { enum: ["waiting", "playing", "judging", "finished"] }).notNull().default("waiting"),
  judgeId: text("judge_id"), // Discord User ID of the current judge
  currentBlackCardId: integer("current_black_card_id").references(() => cards.id),
  pointsToWin: integer("points_to_win").notNull().default(5),
  createdAt: timestamp("created_at").defaultNow(),
});

// Players in a game
export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull().references(() => games.id),
  userId: text("user_id").notNull(), // Discord User ID
  username: text("username").notNull(), // Discord Username
  score: integer("score").default(0).notNull(),
  isVip: boolean("is_vip").default(false), // Can start/stop game
});

// Cards in players' hands
export const hands = pgTable("hands", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull().references(() => players.id),
  cardId: integer("card_id").notNull().references(() => cards.id),
});

// Cards played in the current round
export const playedCards = pgTable("played_cards", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull().references(() => games.id),
  playerId: integer("player_id").notNull().references(() => players.id),
  cardId: integer("card_id").notNull().references(() => cards.id),
});

export const usedCards = pgTable("used_cards", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull().references(() => games.id),
  cardId: integer("card_id").notNull().references(() => cards.id),
  cardType: text("card_type", { enum: ["black", "white"] }).notNull(),
});

// === RELATIONS ===
export const gamesRelations = relations(games, ({ one, many }) => ({
  players: many(players),
  currentBlackCard: one(cards, {
    fields: [games.currentBlackCardId],
    references: [cards.id],
  }),
}));

export const playersRelations = relations(players, ({ one, many }) => ({
  game: one(games, {
    fields: [players.gameId],
    references: [games.id],
  }),
  hand: many(hands),
  playedCards: many(playedCards),
}));

export const handsRelations = relations(hands, ({ one }) => ({
  player: one(players, {
    fields: [hands.playerId],
    references: [players.id],
  }),
  card: one(cards, {
    fields: [hands.cardId],
    references: [cards.id],
  }),
}));

// === SCHEMAS ===
export const insertCardSchema = createInsertSchema(cards);
export const insertGameSchema = createInsertSchema(games);
export const insertPlayerSchema = createInsertSchema(players);

// === TYPES ===
export type Card = typeof cards.$inferSelect;
export type Game = typeof games.$inferSelect;
export type Player = typeof players.$inferSelect;
