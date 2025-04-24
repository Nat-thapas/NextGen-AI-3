/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { eq, sql } from 'drizzle-orm';

import { db } from '$lib/server/db';
import { sessions } from '$lib/server/db/schema';
import { generateToken } from '$lib/token';

const createSessionQuery = db.insert(sessions).values({
	token: sql.placeholder('token'),
	userId: sql.placeholder('usersId'),
	firstLoginIp: sql.placeholder('fisrtLoginIp'),
	firstLoginUserAgent: sql.placeholder('firstLoginUserAgent'),
	lastUseIp: sql.placeholder('lastUseIp'),
	lastUseUserAgent: sql.placeholder('lastUseUserAgent')
});

const getSessionWithUserQuery = db.query.sessions
	.findFirst({
		where: eq(sessions.token, sql.placeholder<string>('token')),
		with: {
			user: true
		}
	})
	.prepare('get_session');

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
