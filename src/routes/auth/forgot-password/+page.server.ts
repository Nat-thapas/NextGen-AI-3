import { redirect } from '@sveltejs/kit';
import { fail, message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

import { base } from '$app/paths';
import { env } from '$env/dynamic/public';

import { configConstants } from '$lib/config-constants';
import { formatDuration, getSecondsSince } from '$lib/datetime';
import { getUserByEmail, updateUserPasswordResetToken } from '$lib/server/db/services/users';
import { generateToken } from '$lib/server/db/token';
import { sendResetEmail } from '$lib/server/email';

import type { Actions, PageServerLoad } from './$types';
import { formSchema } from './schema';

export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(zod(formSchema))
	};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod(formSchema));
		if (!form.valid) return fail(400, { form });

		const user = await getUserByEmail(form.data.email);

		if (!user) {
			form.errors.email = ['Invalid email'];
			return fail(400, { form });
		}

		if (getSecondsSince(user.lastEmailSentAt) < configConstants.users.emailCooldown) {
			form.errors.email = ['Email request quota exceeded'];
			const cooldownRemaining =
				configConstants.users.emailCooldown - Math.floor(getSecondsSince(user.lastEmailSentAt));
			return message(
				form,
				{
					type: 'error',
					text: `You can request another email in ${formatDuration(cooldownRemaining)}`
				},
				{
					status: 400
				}
			);
		}

		const token = generateToken();

		try {
			await sendResetEmail(
				form.data.email,
				`${env.PUBLIC_ORIGIN}${base}/auth/forgot-password/reset?token=${token}`
			);
		} catch (err) {
			console.error(`Failed to sent email to ${form.data.email}, Error: ${err}`);
			return message(
				form,
				{
					type: 'error',
					text: 'An error occurred while sending email, please try again later or contact administrator.'
				},
				{
					status: 500
				}
			);
		}

		await updateUserPasswordResetToken(user.id, token);

		return redirect(303, `${base}/auth/forgot-password/email-sent`);
	}
};
