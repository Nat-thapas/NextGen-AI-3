import fs from 'node:fs/promises';
import { join } from 'node:path';

import { error, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { fail, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

import { base } from '$app/paths';
import { env } from '$env/dynamic/private';

import { configConstants } from '$lib/config-constants';
import { getSecondsSince } from '$lib/datetime';
import { getExtension } from '$lib/files';
import { db } from '$lib/server/db';
import { createFileReturning } from '$lib/server/db/prepared-statements/files';
import { users } from '$lib/server/db/schema';
import { setToastParams } from '$lib/toast';

import type { Actions, PageServerLoad } from './$types';
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
		getSecondsSince(user.verificationTokenGeneratedAt) >
		configConstants.users.registrationSetPasswordTimeout
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
	default: async (event) => {
		const form = await superValidate(event.request, zod(formSchema));
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
			configConstants.users.registrationUpdateProfileTimeout
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

		const transcript = (
			await createFileReturning.execute({
				size: form.data.transcript.size.toString(),
				mimeType: form.data.transcript.type,
				extension: getExtension(form.data.transcript.name, form.data.transcript.type)
			})
		)[0];

		await fs.writeFile(
			join(env.FILE_STORAGE_PATH, transcript.storedName),
			await form.data.transcript.bytes()
		);

		await db
			.update(users)
			.set({
				registrationComplete: true,
				verificationToken: null,
				prefix: form.data.prefix,
				name: form.data.name,
				nickname: form.data.nickname,
				phoneNumber: form.data.phoneNumber,
				schoolName: form.data.schoolName,
				grade: Number(form.data.grade),
				transcriptId: transcript.id,
				addressProvince: form.data.addressProvince,
				addressDistrict: form.data.addressDistrict,
				addressSubDistrict: form.data.addressSubDistrict,
				addressPostcode: form.data.addressPostcode,
				addressDetail: form.data.addressDetail
			})
			.where(eq(users.id, user.id));

		return redirect(
			303,
			setToastParams(`${base}/auth/login`, 'Registration complete', 'Please login', 'success')
		);
	}
};
