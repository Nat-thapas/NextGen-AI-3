import fs from 'fs';
import path from 'path';

import { redirect, type Handle, type ServerInit } from '@sveltejs/kit';
import { sql } from 'drizzle-orm';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import cron from 'node-cron';

import { base } from '$app/paths';
import { env } from '$env/dynamic/private';

import { isTimeZoneValid } from '$lib/datetime';
import { db } from '$lib/server/db';
import { sessions } from '$lib/server/db/schema';
import { deleteSession, updateSessionWithUserReturning } from '$lib/server/db/services/sessions';
import type { Session } from '$lib/server/interfaces/session';
import type { User } from '$lib/server/interfaces/user';
import { setToastParams } from '$lib/toast';

async function pruneSessions(): Promise<void> {
	await db
		.delete(sessions)
		.where(
			sql`${sessions.updatedAt} < now() - (${Number(env.SESSION_LIFETIME)} || ' seconds')::INTERVAL`
		);
}

export const init: ServerInit = async () => {
	if (env.SOCKET_PATH) {
		process.umask(0);
		const socketDirectory = path.dirname(env.SOCKET_PATH);
		if (!fs.existsSync(socketDirectory)) {
			fs.mkdirSync(socketDirectory, { recursive: true });
		}
	}
	await migrate(db, { migrationsFolder: 'drizzle' });
	await db.execute(sql.raw(`ALTER DATABASE "${env.POSTGRES_DB}" SET timezone TO 'UTC'`));
	cron.schedule('0 21 * * *', pruneSessions, {
		timezone: 'UTC',
		runOnInit: true
	});
};

function isRouteProtected(route: string | null): boolean {
	if (route === null) return false;
	if (route === '/(main)') return false;
	if (route === '/(main)/announcements/[id=id]') return false;
	if (route.startsWith('/auth')) return false;
	return true;
}

function isRouteBypassed(route: string | null): boolean {
	if (route === null) return true;
	if (route.startsWith('/api/(public)')) return true;
	return false;
}

function isRouteApi(route: string | null): boolean {
	return route?.startsWith('/api') ?? false;
}

export const handle: Handle = async ({ event, resolve }) => {
	const timeZone = event.cookies.get('time-zone') ?? env.DEFAULT_TIME_ZONE;
	if (isTimeZoneValid(timeZone)) {
		event.locals.timeZone = timeZone;
	} else {
		event.locals.timeZone = env.DEFAULT_TIME_ZONE;
	}

	let session: Session | undefined = undefined;
	let user: User | undefined = undefined;

	if (!isRouteBypassed(event.route.id)) {
		const token = event.cookies.get('token');

		if (token) {
			let ip = '0.0.0.0';
			try {
				ip = event.getClientAddress();
			} catch {} // eslint-disable-line no-empty
			const userAgent = event.request.headers.get('User-Agent') ?? '';

			const result = await updateSessionWithUserReturning(
				token,
				ip,
				userAgent,
				Number(env.SESSION_LIFETIME)
			);

			if (result) {
				session = result.session;
				user = result.user;
			} else {
				await deleteSession(token);
			}
		}

		if (!user && isRouteProtected(event.route.id)) {
			if (token) {
				throw redirect(
					303,
					setToastParams(
						`${base}/?next=${encodeURIComponent(event.url.pathname + event.url.search + event.url.hash)}`,
						'Your session have expired',
						'Please login again to access the page.',
						'error'
					)
				);
			}
			throw redirect(
				303,
				setToastParams(
					`${base}/?next=${encodeURIComponent(event.url.pathname + event.url.search + event.url.hash)}`,
					'You have to login to access the page',
					undefined,
					'error'
				)
			);
		}

		if (
			!isRouteApi(event.route.id) &&
			user &&
			!user.registered &&
			event.route.id != '/auth/register'
		) {
			throw redirect(
				303,
				setToastParams(
					`${base}/auth/register/?next=${encodeURIComponent(event.url.pathname + event.url.search + event.url.hash)}`,
					'Please fill the form to register your account',
					undefined,
					'info'
				)
			);
		}
	}

	event.locals.user = user;
	event.locals.session = session;

	const response = await resolve(event);

	// FIX: for header too big error
	// Uncomment next line to enable
	// response.headers.delete('link');

	return response;
};
