import { redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

import { base } from '$app/paths';

import { db } from '$lib/server/db';
import { sessions } from '$lib/server/db/schema';
import { setToastParams } from '$lib/toast';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.token) {
		await db.delete(sessions).where(eq(sessions.token, locals.token));
	}

	locals.token = undefined;

	return redirect(303, setToastParams(`${base}/`, 'Logout successful', undefined, 'success'));
};
