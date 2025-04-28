import fs from 'node:fs/promises';
import { join } from 'node:path';

import { redirect, type Handle, type ServerInit } from '@sveltejs/kit';
import { sql } from 'drizzle-orm';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

import { base } from '$app/paths';
import { env } from '$env/dynamic/private';

import { getSecondsSince, isTimeZoneValid } from '$lib/datetime';
import { db } from '$lib/server/db';
import { deleteSession, getSessionWithUser, updateSession } from '$lib/server/db/services/sessions';
import type { Session } from '$lib/server/interfaces/session';
import type { User } from '$lib/server/interfaces/user';
import { setToastParams } from '$lib/toast';

export const init: ServerInit = async () => {
	await migrate(db, { migrationsFolder: 'drizzle' });
	await db.execute(sql.raw(`ALTER DATABASE "${env.POSTGRES_DB}" SET timezone TO 'UTC'`));

	const fileStoragePaths = ['/users/transcripts'];

	for (const path of fileStoragePaths) {
		const fullPath = join(env.FILE_STORAGE_PATH, path);
		await fs.mkdir(fullPath, { recursive: true });
	}
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
			const result = await getSessionWithUser(token);
			if (result) {
				if (getSecondsSince(result.updatedAt) > +env.SESSION_LIFETIME) {
					await deleteSession(token);
				} else {
					session = result;
					user = result.user;

					let ip = '0.0.0.0';
					try {
						ip = event.getClientAddress();
					} catch {} // eslint-disable-line no-empty

					const userAgent = event.request.headers.get('User-Agent') ?? '';

					await updateSession({ ip, userAgent, token });
				}
			}
		}

		if (!user && isRouteProtected(event.route.id)) {
			if (token) {
				throw redirect(
					303,
					setToastParams(
						`${base}/auth/login?next=${encodeURIComponent(event.url.pathname + event.url.search + event.url.hash)}`,
						'Your session have expired',
						'Please login again to access the page.',
						'warning'
					)
				);
			}
			throw redirect(
				303,
				setToastParams(
					`${base}/auth/login?next=${encodeURIComponent(event.url.pathname + event.url.search + event.url.hash)}`,
					'You have to login to access the page',
					undefined,
					'warning'
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
