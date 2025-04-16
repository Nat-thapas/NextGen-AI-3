import type { ServerInit } from '@sveltejs/kit';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

import { env } from '$env/dynamic/public';

import { db } from '$lib/server/db';

export const init: ServerInit = async () => {
	console.log(env.PUBLIC_ORIGIN);
	await migrate(db, { migrationsFolder: 'drizzle' });
};
