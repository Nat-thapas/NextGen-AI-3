import { eq, sql } from 'drizzle-orm';

import { db } from '$lib/server/db';
import { sessions } from '$lib/server/db/schema';

export const getSession = db.query.sessions
	.findFirst({
		where: eq(sessions.token, sql.placeholder<string>('token')),
		with: {
			user: true
		}
	})
	.prepare('get_session');

export const updateSession = db
	.update(sessions)
	.set({
		lastUseIP: sql`${sql.placeholder<string>('ip')}`,
		lastUseUserAgent: sql`${sql.placeholder<string>('userAgent')}`
	})
	.where(eq(sessions.token, sql.placeholder<string>('token')))
	.prepare('update_session');

export const deleteSession = db
	.delete(sessions)
	.where(eq(sessions.token, sql.placeholder<string>('token')))
	.prepare('delete_session');
