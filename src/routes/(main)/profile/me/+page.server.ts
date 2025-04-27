import fs from 'node:fs/promises';
import { join } from 'node:path';

import { error } from '@sveltejs/kit';
import argon2 from 'argon2';
import { fail, message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

import { env } from '$env/dynamic/private';

import { getExtension } from '$lib/files';
import { createFileReturning, deleteFile, getFile } from '$lib/server/db/services/files';
import {
	getUser,
	updateUserPassword,
	updateUserProfile,
	updateUserProfileWithTranscript
} from '$lib/server/db/services/users';

import type { Actions, PageServerLoad } from './$types';
import { changePasswordFormSchema, updateProfileFormSchema } from './schema';

export const load: PageServerLoad = async (event) => {
	const eventUser = event.locals.user;
	if (!eventUser) {
		error(401, {
			message: 'You have to be logged in to access this page'
		});
	}

	const user = await getUser(eventUser.id);
	if (!user) {
		error(401, {
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
		changePasswordForm: await superValidate(zod(changePasswordFormSchema)),
		transcript: user.transcriptId ? await getFile(user.transcriptId) : undefined
	};
};

export const actions: Actions = {
	'update-profile': async (event) => {
		const form = await superValidate(event.request, zod(updateProfileFormSchema));
		if (!form.valid) return fail(400, { form });

		const user = event.locals.user;

		if (!user) {
			error(401, {
				message: 'You have to be logged in to access this page'
			});
		}

		if (form.data.transcript) {
			const oldTranscript = user.transcriptId ? await getFile(user.transcriptId) : undefined;
			const transcript = await createFileReturning({
				size: form.data.transcript.size,
				mimeType: form.data.transcript.type,
				extension: getExtension(form.data.transcript.name, form.data.transcript.type),
				referenceId: user.id
			});

			await fs.writeFile(
				join(env.FILE_STORAGE_PATH, transcript.storedName),
				await form.data.transcript.bytes()
			);

			await updateUserProfileWithTranscript({
				id: user.id,
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
			});

			if (oldTranscript) {
				await deleteFile(oldTranscript.id);

				try {
					await fs.unlink(join(env.FILE_STORAGE_PATH, oldTranscript.storedName));
				} catch (err) {
					console.error(`Cannot delete file '${oldTranscript.storedName}'`);
					console.error(err);
				}
			}
		} else {
			await updateUserProfile({
				id: user.id,
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
			});
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
			error(401, {
				message: 'You have to be logged in to access this page'
			});
		}

		if (!(await argon2.verify(user.hashedPassword!, form.data.currentPassword))) {
			form.errors.currentPassword = ['Invalid password'];
			return fail(400, { form });
		}

		const hashedPassword = await argon2.hash(form.data.newPassword);

		await updateUserPassword(user.id, hashedPassword);

		return message(form, {
			type: 'success',
			text: 'Password updated successfully'
		});
	}
};
