import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { env } from '$env/dynamic/private';

import * as schema from './schema';

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
	casing: 'snake_case',
	schema,
	logger: env.NODE_ENV.toLowerCase() !== 'production'
});
