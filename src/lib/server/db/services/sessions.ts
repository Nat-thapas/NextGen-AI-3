/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { and, eq, sql } from 'drizzle-orm';

import { db } from '$lib/server/db';
import { sessions, users } from '$lib/server/db/schema';
import { generateToken } from '$lib/server/db/token';

const createSessionQuery = db
	.insert(sessions)
	.values({
		token: sql.placeholder('token'),
		userId: sql.placeholder('userId'),
		firstLoginIp: sql.placeholder('firstLoginIp'),
		firstLoginUserAgent: sql.placeholder('firstLoginUserAgent'),
		lastUseIp: sql.placeholder('lastUseIp'),
		lastUseUserAgent: sql.placeholder('lastUseUserAgent')
	})
	.prepare('create_session');

const updateSessionWithUserReturningQuery = db
	.update(sessions)
	.set({
		lastUseIp: sql.placeholder<string>('ip'),
		lastUseUserAgent: sql.placeholder<string>('userAgent'),
		updatedAt: sql`now()`
	})
	.from(users)
	.where(
		and(
			eq(sessions.token, sql.placeholder('token')),
			eq(users.id, sessions.userId),
			sql`${sessions.updatedAt} > now() - (${sql.placeholder('sessionLifetime')} || ' seconds')::INTERVAL`
		)
	)
	.returning({
		session: {
			token: sessions.token,
			updatedAt: sessions.updatedAt
		},
		user: {
			id: users.id,
			role: users.role,
			email: users.email,
			prefix: users.prefix,
			name: users.name,
			hashedPassword: users.hashedPassword,
			transcriptId: users.transcriptId
		}
	})
	.prepare('update_session_with_user_returning');

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

export async function updateSessionWithUserReturning(
	token: string,
	ip: string,
	userAgent: string,
	sessionLifetime: number
) {
	return (
		await updateSessionWithUserReturningQuery.execute({ token, ip, userAgent, sessionLifetime })
	)[0];
}

export async function deleteSession(token: string) {
	return deleteSessionQuery.execute({ token });
}
