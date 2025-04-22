import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';

import { env } from '$env/dynamic/private';

import * as schema from './schema';

if (pg.native === null || pg.native === undefined) {
	throw Error('pg-native is required for this application');
}

const pool = new pg.native.Pool({
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
