import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const content = sqliteTable("content", {
  id: integer("id").primaryKey(),
  document: text("document").notNull(),
  revision: integer("revision").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const assets = sqliteTable("assets", {
  id: text("id").primaryKey(),
  objectKey: text("object_key").notNull(),
  name: text("name").notNull(),
  mime: text("mime").notNull(),
  size: integer("size").notNull(),
  kind: text("kind").notNull(),
  targetId: text("target_id").notNull(),
  createdAt: text("created_at").notNull(),
});
