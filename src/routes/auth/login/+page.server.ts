import { redirect } from '@sveltejs/kit';
import argon2 from 'argon2';
import { eq } from 'drizzle-orm';
import { fail, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

import { base } from '$app/paths';

import { db } from '$lib/server/db';
import { sessions, users } from '$lib/server/db/schema';
import { setToastParams } from '$lib/toast';
import { generateToken } from '$lib/token';

import type { Actions, PageServerLoad } from './$types';
import { formSchema } from './schema';

export const load: PageServerLoad = async ({ url }) => {
	let next = url.searchParams.get('next') ?? '';
	next = decodeURIComponent(next);
	next ||= `${base}/`;
	if (!next.startsWith('/')) {
		next = '/' + next;
	}

	return { form: await superValidate({ next }, zod(formSchema), { errors: false }) };
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event.request, zod(formSchema));
		if (!form.valid) return fail(400, { form });

		const user = await db.query.users.findFirst({
			where: eq(users.email, form.data.email)
		});
		if (user === undefined) {
			form.errors.email = ['Invalid email'];
			return fail(400, { form });
		}
		if (!user.registrationComplete) {
			form.errors.email = ['This account have not finished registration yet'];
			return fail(400, { form });
		}
		if (!(await argon2.verify(user.hashedPassword!, form.data.password))) {
			form.errors.password = ['Invalid password'];
			return fail(400, { form });
		}

		if (argon2.needsRehash(user.hashedPassword!)) {
			const hashedPassword = await argon2.hash(form.data.password);
			await db
				.update(users)
				.set({
					hashedPassword
				})
				.where(eq(users.id, user.id));
		}

		const token = generateToken();

		await db.insert(sessions).values({
			token,
			userId: user.id,
			firstLoginIP: event.getClientAddress(),
			firstLoginUserAgent: event.request.headers.get('User-Agent') ?? '',
			lastUseIP: event.getClientAddress(),
			lastUseUserAgent: event.request.headers.get('User-Agent') ?? ''
		});

		event.cookies.set('token', token, {
			httpOnly: true,
			secure: true,
			path: `${base}/`,
			sameSite: 'lax',
			priority: 'high',
			maxAge: 60 * 60 * 24 * 365
		});

		let next = form.data.next;
		next ||= `${base}/`;
		if (!next.startsWith('/')) {
			next = '/' + next;
		}

		return redirect(303, setToastParams(next, 'Login successful', undefined, 'success'));
	}
};
