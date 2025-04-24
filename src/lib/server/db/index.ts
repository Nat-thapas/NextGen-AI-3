import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';

import { env } from '$env/dynamic/private';

import * as schema from '$lib/server/db/schema';

let Pool: typeof pg.Pool;

if (pg.native === undefined || pg.native === null) {
	console.warn('pg-native is not available, this will lead to degraded performance');
	Pool = pg.Pool;
} else {
	Pool = pg.native.Pool;
}

const pool = new Pool({
	host: env.POSTGRES_HOST,
	port: +env.POSTGRES_PORT,
	user: env.POSTGRES_USER,
	password: env.POSTGRES_PASSWORD,
	database: env.POSTGRES_DB,
	max: 16,
	ssl: false
});

export const db = drizzle({
	client: pool,
	schema,
	casing: 'snake_case',
	logger: env.NODE_ENV.toLowerCase() !== 'production'
});
