import { redirect } from '@sveltejs/kit';
import argon2 from 'argon2';
import { eq } from 'drizzle-orm';
import { fail, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

import { base } from '$app/paths';

import { configConstants } from '$lib/config-constants';
import { getSecondsSince } from '$lib/datetime';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { setToastParams } from '$lib/toast';

import type { Actions } from '../$types';
import type { PageServerLoad } from './$types';
import { formSchema } from './schema';

export const load: PageServerLoad = async ({ url }) => {
	const token = url.searchParams.get('token');
	if (!token) {
		redirect(
			303,
			setToastParams(
				`${base}/auth/register`,
				'Invalid URL',
				'This URL is invalid, please ensure the URL in the email and in your browser address bar is the same.',
				'error'
			)
		);
	}

	const user = await db.query.users.findFirst({
		where: eq(users.verificationToken, token)
	});
	if (!user) {
		redirect(
			303,
			setToastParams(
				`${base}/auth/register`,
				'Invalid token',
				'The token is invalid, if you have requested a new email, please use the link contained in that email instead.',
				'error'
			)
		);
	}
	if (user.registrationComplete) {
		redirect(
			303,
			setToastParams(
				`${base}/auth/login`,
				'You have already registered',
				'Your account have already been registered, please login instead.',
				'info'
			)
		);
	}
	if (
		getSecondsSince(user.verificationTokenGeneratedAt) > configConstants.users.verificationTimeout
	) {
		redirect(
			303,
			setToastParams(
				`${base}/auth/register`,
				'Token expired',
				'The token is expired, please request a new one if you want to start the process again.',
				'error'
			)
		);
	}

	return {
		form: await superValidate({ token, email: user.email }, zod(formSchema), { errors: false })
	};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod(formSchema));

		if (!form.valid) return fail(400, { form });

		if (!form.data.token) {
			redirect(
				303,
				setToastParams(
					`${base}/auth/register`,
					'Missing token',
					'Your response does not contain a token, please click the link in your email again or restart the registration process.',
					'error'
				)
			);
		}

		const user = await db.query.users.findFirst({
			where: eq(users.verificationToken, form.data.token)
		});
		if (!user) {
			redirect(
				303,
				setToastParams(
					`${base}/auth/register`,
					'Invalid token',
					'Your response contains an invalid token, if you have requested a new email, please use the link contained in that email instead.',
					'error'
				)
			);
		}
		if (user.registrationComplete) {
			redirect(
				303,
				setToastParams(
					`${base}/auth/login`,
					'You have already registered',
					'Your account have already been registered, please login instead.',
					'info'
				)
			);
		}
		if (
			getSecondsSince(user.verificationTokenGeneratedAt) >
			configConstants.users.verificationTimeout +
				configConstants.users.verificationTimeoutGracePeriod
		) {
			redirect(
				303,
				setToastParams(
					`${base}/auth/register`,
					'Token expired',
					'Your response contains an expired token, please request a new one if you want to start the process again.',
					'error'
				)
			);
		}

		const hashedPassword = await argon2.hash(form.data.password);

		await db.update(users).set({ hashedPassword }).where(eq(users.id, user.id));

		return redirect(
			303,
			setToastParams(
				`${base}/auth/register/profile`,
				'Accoount created',
				'Please fill in your informations to complete the registration process',
				'info'
			)
		);
	}
};
