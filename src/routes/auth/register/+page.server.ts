import fs from 'node:fs/promises';
import { join } from 'node:path';

import { redirect } from '@sveltejs/kit';
import { fail, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

import { base } from '$app/paths';
import { env } from '$env/dynamic/private';

import { getExtension } from '$lib/files';
import { createFileWithId } from '$lib/server/db/services/files';
import { updateUserProfileRegistrationComplete } from '$lib/server/db/services/users';
import { generateSuid } from '$lib/server/db/suid';
import { setToastParams } from '$lib/toast';

import type { Actions, PageServerLoad } from './$types';
import { formSchema } from './schema';

export const load: PageServerLoad = async (event) => {
	const user = event.locals.user;

	if (!user) {
		redirect(
			303,
			setToastParams(
				`${base}/?next=${encodeURIComponent(event.url.pathname + event.url.search)}`,
				'You have to login to access the page',
				undefined,
				'error'
			)
		);
	}

	let next = event.url.searchParams.get('next');
	next ||= `${base}/`;
	if (!next.startsWith('/')) {
		next = `/${next}`;
	}

	if (user.registered) {
		redirect(
			303,
			setToastParams(
				next,
				'You have already registered',
				'Your account have already been successfully registered.',
				'info'
			)
		);
	}

	return {
		form: await superValidate({ next, email: user.email }, zod(formSchema), { errors: false })
	};
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event.request, zod(formSchema));
		if (!form.valid) return fail(400, { form });

		const user = event.locals.user;
		if (!user) {
			redirect(
				303,
				setToastParams(
					`${base}/?next=${encodeURIComponent(event.url.pathname + event.url.search)}`,
					'You have to login to access the page',
					undefined,
					'error'
				)
			);
		}

		let next = form.data.next;
		next ||= `${base}/`;
		if (!next.startsWith('/')) {
			next = `/${next}`;
		}

		if (user.registered) {
			redirect(
				303,
				setToastParams(
					next,
					'You have already registered',
					'Your account have already been successfully registered.',
					'info'
				)
			);
		}

		const transcriptId = generateSuid();
		const transcriptExtension = getExtension(form.data.transcript.name, form.data.transcript.type);

		await fs.writeFile(
			join(env.FILE_STORAGE_PATH, transcriptId + transcriptExtension),
			await form.data.transcript.bytes()
		);

		await createFileWithId({
			id: transcriptId,
			size: form.data.transcript.size,
			mimeType: form.data.transcript.type,
			extension: transcriptExtension,
			referenceId: user.id
		});

		await updateUserProfileRegistrationComplete({
			id: user.id,
			prefix: form.data.prefix,
			name: form.data.name,
			nickname: form.data.nickname,
			phoneNumber: form.data.phoneNumber,
			schoolName: form.data.schoolName,
			grade: form.data.grade,
			transcriptId: transcriptId,
			addressProvince: form.data.addressProvince,
			addressDistrict: form.data.addressDistrict,
			addressSubDistrict: form.data.addressSubDistrict,
			addressPostcode: form.data.addressPostcode,
			addressDetail: form.data.addressDetail
		});

		return redirect(
			303,
			setToastParams(next, 'Registration completed successfully', undefined, 'success')
		);
	}
};
