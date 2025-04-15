import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

import { base } from '$app/paths';
import { env } from '$env/dynamic/public';

import { configConstants } from '$lib/config-constants';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { sendVerifyEmail } from '$lib/server/email';
import { generateToken } from '$lib/utils';

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

		const user = await db.query.users.findFirst({
			where: eq(users.email, form.data.email)
		});

		if (user !== undefined) {
			if (user.verified) {
				form.errors.email = ['This email is already in use'];
				return fail(400, { form });
			}
			if (
				(new Date().getTime() - user.lastEmailSentAt.getTime()) / 1000 <
				configConstants.users.emailCooldown
			) {
				form.errors.email = [
					`You can only request an email every ${configConstants.users.emailCooldown} seconds`
				];
				return fail(400, { form });
			}
		}

		const token = generateToken(256);

		try {
			sendVerifyEmail(
				form.data.email,
				`${env.PUBLIC_ORIGIN}${base}/auth/register/verify?token=${token}`
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

		return redirect(303, `${base}/auth/register/email-sent`);
	}
};
