import { pgTable, text, serial, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  type: text("type", {
    enum: ["reasoning", "answer", "transaction", "error", "notice"],
  }).notNull(),
  conversationId: text("conversation_id").notNull(),
  isUser: boolean("is_user").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const messageSchema = createInsertSchema(messages);
export const conversationSchema = createInsertSchema(conversations);

export type Message = typeof messages.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
export type InsertMessage = z.infer<typeof messageSchema>;
export type InsertConversation = z.infer<typeof conversationSchema>;
