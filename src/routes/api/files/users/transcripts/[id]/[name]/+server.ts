import fs from 'node:fs/promises';

import { error } from '@sveltejs/kit';

import { env } from '$env/dynamic/private';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => {
	const user = event.locals.user;

	if (!user) {
		error(403, {
			message: 'Forbidden'
		});
	}

	const id = event.params.id;

	if (id !== user.id) {
		error(403, {
			message: 'Forbidden'
		});
	}

	const path = env.FILE_STORAGE_PATH + '/users/transcripts/' + user.id + '.pdf';

	try {
		const file = await fs.readFile(path);
		return new Response(file, {
			headers: {
				'Content-Type': 'application/pdf',
				'Content-Disposition': 'inline; filename=Transcript.pdf'
			}
		});
	} catch {
		error(404, {
			message: 'Not Found'
		});
	}
};
