import type { ServerInit } from '@sveltejs/kit';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

import { db } from '$lib/server/db';

export const init: ServerInit = async () => {
	await migrate(db, { migrationsFolder: 'drizzle' });
};
