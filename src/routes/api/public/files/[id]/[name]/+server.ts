import fs from 'node:fs/promises';
import { join } from 'node:path';

import { error } from '@sveltejs/kit';

import { env } from '$env/dynamic/private';

import { getFile } from '$lib/server/db/prepared-statements/files';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => {
	const id = event.params.id;
	const name = event.params.name;

	const file = await getFile.execute({ id });

	if (!file) {
		error(404, {
			message: 'Not Found'
		});
	}

	const path = join(env.FILE_STORAGE_PATH, file.storedName);

	try {
		const data = await fs.readFile(path);
		return new Response(data, {
			headers: {
				'Content-Type': file.mime,
				'Content-Disposition': `inline; filename=${name}`
			}
		});
	} catch {
		error(404, {
			message: 'Not Found'
		});
	}
};
