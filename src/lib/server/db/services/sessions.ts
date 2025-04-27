/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { eq, sql } from 'drizzle-orm';

import { db } from '$lib/server/db';
import { sessions } from '$lib/server/db/schema';
import { generateToken } from '$lib/server/db/token';

const createSessionQuery = db.insert(sessions).values({
	token: sql.placeholder('token'),
	userId: sql.placeholder('userId'),
	firstLoginIp: sql.placeholder('firstLoginIp'),
	firstLoginUserAgent: sql.placeholder('firstLoginUserAgent'),
	lastUseIp: sql.placeholder('lastUseIp'),
	lastUseUserAgent: sql.placeholder('lastUseUserAgent')
});

const getSessionWithUserQuery = db.query.sessions
	.findFirst({
		columns: {
			token: true,
			updatedAt: true
		},
		where: eq(sessions.token, sql.placeholder<string>('token')),
		with: {
			user: {
				columns: {
					id: true,
					role: true,
					email: true,
					hashedPassword: true,
					transcriptId: true
				}
			}
		}
	})
	.prepare('get_session_with_user');

const updateSessionQuery = db
	.update(sessions)
	.set({
		lastUseIp: sql.placeholder<string>('ip'),
		lastUseUserAgent: sql.placeholder<string>('userAgent'),
		updatedAt: sql`now()`
	})
	.where(eq(sessions.token, sql.placeholder<string>('token')))
	.prepare('update_session');

const deleteSessionQuery = db
	.delete(sessions)
	.where(eq(sessions.token, sql.placeholder<string>('token')))
	.prepare('delete_session');

export async function createSession(data: {
	token?: string;
	userId: string;
	firstLoginIp: string;
	firstLoginUserAgent: string;
	lastUseIp: string;
	lastUseUserAgent: string;
}) {
	data.token ??= generateToken();
	return createSessionQuery.execute(data);
}

export async function getSessionWithUser(token: string) {
	return getSessionWithUserQuery.execute({ token });
}

export async function updateSession(data: { token: string; ip: string; userAgent: string }) {
	return updateSessionQuery.execute(data);
}

export async function deleteSession(token: string) {
	return deleteSessionQuery.execute({ token });
}
