import { redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { fail, message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

import { base } from '$app/paths';
import { env } from '$env/dynamic/public';

import { configConstants } from '$lib/config-constants';
import { formatDuration, getSecondsSince, utcNow } from '$lib/datetime';
import { roles } from '$lib/enums';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { sendVerifyEmail } from '$lib/server/email';
import { generateToken } from '$lib/token';

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
		}

		const token = generateToken();

		try {
			await sendVerifyEmail(
				form.data.email,
				`${env.PUBLIC_ORIGIN}${base}/auth/register/continue?token=${token}`
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

		if (user === undefined) {
			await db.insert(users).values({
				email: form.data.email,
				role: roles.registrant,
				verificationToken: token,
				verificationTokenGeneratedAt: utcNow(),
				lastEmailSentAt: utcNow()
			});
		} else {
			await db
				.update(users)
				.set({
					verificationToken: token,
					verificationTokenGeneratedAt: utcNow(),
					lastEmailSentAt: utcNow()
				})
				.where(eq(users.id, user.id));
		}

		return redirect(303, `${base}/auth/register/email-sent`);
	}
};
