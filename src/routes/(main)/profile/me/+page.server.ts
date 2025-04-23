import fs from 'node:fs/promises';
import { join } from 'node:path';

import { error } from '@sveltejs/kit';
import argon2 from 'argon2';
import { eq } from 'drizzle-orm';
import { fail, message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

import { env } from '$env/dynamic/private';

import { getExtension } from '$lib/files';
import { db } from '$lib/server/db';
import { createFileReturning, getFile } from '$lib/server/db/prepared-statements/files';
import { users } from '$lib/server/db/schema';

import type { Actions, PageServerLoad } from './$types';
import { changePasswordFormSchema, updateProfileFormSchema } from './schema';

export const load: PageServerLoad = async (event) => {
	const user = event.locals.user;

	if (!user) {
		error(403, {
			message: 'You have to be logged in to access this page'
		});
	}

	return {
		updateProfileForm: await superValidate(
			{
				prefix: user.prefix ?? undefined,
				name: user.name ?? undefined,
				nickname: user.nickname ?? undefined,
				phoneNumber: user.phoneNumber ?? undefined,
				schoolName: user.schoolName ?? undefined,
				grade: user.grade ? String(user.grade) : undefined,
				addressProvince: user.addressProvince ?? undefined,
				addressDistrict: user.addressDistrict ?? undefined,
				addressSubDistrict: user.addressSubDistrict ?? undefined,
				addressPostcode: user.addressPostcode ?? undefined,
				addressDetail: user.addressDetail ?? undefined
			},
			zod(updateProfileFormSchema),
			{ errors: false }
		),
		transcript: await getFile.execute({ id: user.transcriptId }),
		changePasswordForm: await superValidate(zod(changePasswordFormSchema))
	};
};

export const actions: Actions = {
	'update-profile': async (event) => {
		const form = await superValidate(event.request, zod(updateProfileFormSchema));

		if (!form.valid) return fail(400, { form });

		const user = event.locals.user;

		if (!user) {
			error(403, {
				message: 'You have to be logged in to access this page'
			});
		}

		if (form.data.transcript) {
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
		} else {
			await db
				.update(users)
				.set({
					prefix: form.data.prefix,
					name: form.data.name,
					nickname: form.data.nickname,
					phoneNumber: form.data.phoneNumber,
					schoolName: form.data.schoolName,
					grade: Number(form.data.grade),
					addressProvince: form.data.addressProvince,
					addressDistrict: form.data.addressDistrict,
					addressSubDistrict: form.data.addressSubDistrict,
					addressPostcode: form.data.addressPostcode,
					addressDetail: form.data.addressDetail
				})
				.where(eq(users.id, user.id));
		}

		return message(form, {
			type: 'success',
			text: 'Profile updated successfully'
		});
	},

	'change-password': async (event) => {
		const form = await superValidate(event.request, zod(changePasswordFormSchema));

		if (!form.valid) return fail(400, { form });

		const user = event.locals.user;

		if (!user) {
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
