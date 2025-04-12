import { integer, pgTable, serial, text } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
	id: serial('id').primaryKey(),
	age: integer('age'),
	email: text('email').notNull()
});
