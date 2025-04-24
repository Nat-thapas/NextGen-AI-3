import { redirect } from '@sveltejs/kit';

import { base } from '$app/paths';

import { deleteSession } from '$lib/server/db/services/sessions';
import { setToastParams } from '$lib/toast';

import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ locals, cookies }) => {
		if (locals.session) {
			await deleteSession(locals.session.token);
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
