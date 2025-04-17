import fs from 'node:fs/promises';

import { error } from '@sveltejs/kit';
import argon2 from 'argon2';
import { eq } from 'drizzle-orm';
import { fail, message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

import { env } from '$env/dynamic/private';

import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';

import type { Actions, PageServerLoad } from './$types';
import { changePasswordSchema, formSchema } from './schema';

export const load: PageServerLoad = async (event) => {
	const user = event.locals.user;

	if (!user) {
		error(403, {
			message: 'You have to be logged in to access this page'
		});
	}

	const form = await superValidate(zod(formSchema));

	if (user.prefix !== null) form.data.prefix = user.prefix;
	if (user.name !== null) form.data.name = user.name;
	if (user.nickname !== null) form.data.nickname = user.nickname;
	if (user.phoneNumber !== null) form.data.phoneNumber = user.phoneNumber;
	if (user.schoolName !== null) form.data.schoolName = user.schoolName;
	if (user.grade !== null) form.data.grade = String(user.grade);
	if (user.addressProvince !== null) form.data.addressProvince = user.addressProvince;
	if (user.addressDistrict !== null) form.data.addressDistrict = user.addressDistrict;
	if (user.addressSubDistrict !== null) form.data.addressSubDistrict = user.addressSubDistrict;
	if (user.addressPostcode !== null) form.data.addressPostcode = user.addressPostcode;
	if (user.addressDetail !== null) form.data.addressDetail = user.addressDetail;

	const changePasswordForm = await superValidate(zod(changePasswordSchema));

	return { form, userHaveTranscript: user.isTranscriptAvailable, changePasswordForm };
};

export const actions: Actions = {
	'update-profile': async (event) => {
		const form = await superValidate(event.request, zod(formSchema));

		if (!form.valid) return fail(400, { form });

		const user = event.locals.user;

		if (!user) {
			error(403, {
				message: 'You have to be logged in to access this page'
			});
		}

		if (form.data.transcript) {
			const transcriptSavePath = env.FILE_STORAGE_PATH + '/users/transcripts/' + user.id + '.pdf';
			await fs.writeFile(transcriptSavePath, await form.data.transcript.bytes());
		}

		await db
			.update(users)
			.set({
				prefix: form.data.prefix,
				name: form.data.name,
				nickname: form.data.nickname,
				phoneNumber: form.data.phoneNumber,
				schoolName: form.data.schoolName,
				grade: Number(form.data.grade),
				isTranscriptAvailable: form.data.transcript ? true : undefined,
				addressProvince: form.data.addressProvince,
				addressDistrict: form.data.addressDistrict,
				addressSubDistrict: form.data.addressSubDistrict,
				addressPostcode: form.data.addressPostcode,
				addressDetail: form.data.addressDetail
			})
			.where(eq(users.id, user.id));

		return message(form, {
			type: 'success',
			text: 'Profile updated successfully'
		});
	},

	'change-password': async (event) => {
		const form = await superValidate(event.request, zod(changePasswordSchema));

		if (!form.valid) return fail(400, { form });

		const user = event.locals.user;

		if (!user || !user.verified) {
			error(403, {
				message: 'You have to be logged in to access this page'
			});
		}

		if (!(await argon2.verify(user.hashedPassword!, form.data.currentPassword))) {
			form.errors.currentPassword = ['Invalid password'];
			return fail(400, { form });
		}

		const hashedPassword = await argon2.hash(form.data.newPassword);

		await db
			.update(users)
			.set({
				hashedPassword
			})
			.where(eq(users.id, user.id));

		return message(form, {
			type: 'success',
			text: 'Password updated successfully'
		});
	}
};
