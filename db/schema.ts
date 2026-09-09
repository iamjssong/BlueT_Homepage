import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
export const posts=sqliteTable('posts',{id:integer('id').primaryKey({autoIncrement:true}),category:text('category').notNull(),title:text('title').notNull(),body:text('body').notNull(),date:text('date').notNull().default(sql`(date('now','+9 hours'))`)});
export const authAttempts=sqliteTable('auth_attempts',{key:text('key').primaryKey(),attempts:integer('attempts').notNull(),expires:integer('expires').notNull()});
