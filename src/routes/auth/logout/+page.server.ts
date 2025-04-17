import { redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

import { base } from '$app/paths';

import { db } from '$lib/server/db';
import { sessions } from '$lib/server/db/schema';
import { setToastParams } from '$lib/toast';

import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ locals, cookies }) => {
		if (locals.token) {
			await db.delete(sessions).where(eq(sessions.token, locals.token));
		}

		cookies.set('token', '', {
			httpOnly: true,
			secure: true,
			path: `${base}/`,
			sameSite: 'lax',
			priority: 'high',
			expires: new Date(0)
		});

		return redirect(303, setToastParams(`${base}/`, 'Logout successful', undefined, 'success'));
	}
};
