import fs from 'node:fs/promises';

import { redirect, type Handle, type ServerInit } from '@sveltejs/kit';
import cookie from 'cookie';
import { eq } from 'drizzle-orm';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

import { base } from '$app/paths';
import { env } from '$env/dynamic/private';

import { db } from '$lib/server/db';
import { sessions } from '$lib/server/db/schema';
import type { Session } from '$lib/server/interfaces/session';
import type { User } from '$lib/server/interfaces/user';
import { setToastParams } from '$lib/toast';

export const init: ServerInit = async () => {
	await migrate(db, { migrationsFolder: 'drizzle' });

	const fileStoragePaths = ['/users/transcripts'];

	for (const path of fileStoragePaths) {
		const fullPath = env.FILE_STORAGE_PATH + path;
		await fs.mkdir(fullPath, { recursive: true });
	}
};

function isRouteProtected(route: string | null): boolean {
	if (route === null) return false;
	if (route === '/(main)') return false;
	if (route === '/(main)/announcement/[id]') return false;
	if (route.startsWith('/auth')) return false;
	return true;
}

function isRouteBypassed(route: string | null): boolean {
	if (route === null) return true;
	if (route.startsWith('/(api)/public')) return true;
	return false;
}

export const handle: Handle = async ({ event, resolve }) => {
	const cookies = cookie.parse(event.request.headers.get('Cookie') ?? '');
	const token = cookies.token;

	let session: Session | undefined = undefined;
	let user: User | undefined = undefined;

	if (!isRouteBypassed(event.route.id)) {
		if (token) {
			const result = await db.query.sessions.findFirst({
				where: eq(sessions.token, token),
				with: {
					user: true
				}
			});
			if (result) {
				if (
					(Date.now() - result.createdAt.getTime()) / 1000 > +env.SESSION_LIFETIME &&
					(Date.now() - result.updatedAt.getTime()) / 1000 > +env.SESSION_GRACEPERIOD
				) {
					session = result;
					user = result.user;

					session.lastUseIP = event.getClientAddress();
					session.lastUseUserAgent = event.request.headers.get('User-Agent') ?? '';

					await db
						.update(sessions)
						.set({
							lastUseIP: event.getClientAddress(),
							lastUseUserAgent: event.request.headers.get('User-Agent') ?? ''
						})
						.where(eq(sessions.token, token));
				} else {
					await db.delete(sessions).where(eq(sessions.token, result.token));
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

	event.locals.token = token;
	event.locals.user = user;
	event.locals.session = session;

	const response = await resolve(event);

	// FIX: for header too big error
	// Uncomment next line to enable
	// response.headers.delete('link');

	if (event.locals.token !== token) {
		if (!event.locals.token) {
			response.headers.append(
				'Set-Cookie',
				cookie.serialize('token', '', {
					httpOnly: true,
					secure: true,
					path: `${base}/`,
					sameSite: 'lax',
					priority: 'high',
					expires: new Date(0)
				})
			);
		} else {
			response.headers.append(
				'Set-Cookie',
				cookie.serialize('token', event.locals.token, {
					httpOnly: true,
					secure: true,
					path: `${base}/`,
					sameSite: 'lax',
					priority: 'high',
					maxAge: 60 * 60 * 24 * 365
				})
			);
		}
	}

	return response;
};
