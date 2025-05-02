import { redirect } from '@sveltejs/kit';
import argon2 from 'argon2';
import { fail, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

import { base } from '$app/paths';

import { configConstants } from '$lib/config-constants';
import { getSecondsSince } from '$lib/datetime';
import { getUserByPasswordResetToken, updateUserPassword } from '$lib/server/db/services/users';
import { setToastParams } from '$lib/toast';

import type { Actions, PageServerLoad } from './$types';
import { formSchema } from './schema';

export const load: PageServerLoad = async ({ url }) => {
	const token = url.searchParams.get('token');
	if (!token) {
		redirect(
			303,
			setToastParams(
				`${base}/auth/forgot-password`,
				'Invalid URL',
				'This URL is invalid, please ensure the URL in the email and in your browser address bar is the same.',
				'error'
			)
		);
	}

	const user = await getUserByPasswordResetToken(token);
	if (!user) {
		redirect(
			303,
			setToastParams(
				`${base}/auth/forgot-password`,
				'Invalid token',
				'The token is invalid, if you have requested a new email, please use the link contained in that email instead.',
				'error'
			)
		);
	}
	if (
		getSecondsSince(user.passwordResetTokenGeneratedAt) >
		configConstants.users.passwordResetLinkTimeout
	) {
		redirect(
			303,
			setToastParams(
				`${base}/auth/forgot-password`,
				'Token expired',
				'The token is expired, please request a new one if you want to start the process again.',
				'error'
			)
		);
	}

	return {
		form: await superValidate({ token }, zod(formSchema), { errors: false })
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
					`${base}/auth/forgot-password`,
					'Missing token',
					'Your response does not contain a token, please click the link in your email again or restart the password reset process.',
					'error'
				)
			);
		}

		const user = await getUserByPasswordResetToken(form.data.token);
		if (!user) {
			redirect(
				303,
				setToastParams(
					`${base}/auth/forgot-password`,
					'Invalid token',
					'Your response contains an invalid token, if you have requested a new email, please use the link contained in that email instead.',
					'error'
				)
			);
		}
		if (
			getSecondsSince(user.passwordResetTokenGeneratedAt) >
			configConstants.users.passwordResetResetTimeout
		) {
			redirect(
				303,
				setToastParams(
					`${base}/auth/forgot-password`,
					'Token expired',
					'Your response contains an expired token, please request a new one if you want to start the process again.',
					'error'
				)
			);
		}

		const hashedPassword = await argon2.hash(form.data.password);

		await updateUserPassword(user.id, hashedPassword);

		return redirect(
			303,
			setToastParams(
				`${base}/auth/login`,
				'Password reset successful',
				'You can now login with your new password',
				'success'
			)
		);
	}
};
