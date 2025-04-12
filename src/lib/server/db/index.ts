import { drizzle } from 'drizzle-orm/node-postgres';

import { env } from '$env/dynamic/private';

export const db = drizzle(
	`postgres://${env.POSTGRES_USER}:${env.POSTGRES_PASSWORD}@${env.POSTGRES_HOST}:${env.POSTGRES_PORT}/${env.POSTGRES_DB}`
);
