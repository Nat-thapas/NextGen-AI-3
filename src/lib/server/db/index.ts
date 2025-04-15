import { drizzle } from 'drizzle-orm/node-postgres';

import { env } from '$env/dynamic/private';

import * as schema from './schema';

export const db = drizzle({
	connection: `postgres://${env.POSTGRES_USER}:${env.POSTGRES_PASSWORD}@${env.POSTGRES_HOST}:${env.POSTGRES_PORT}/${env.POSTGRES_DB}`,
	casing: 'snake_case',
	schema
});
