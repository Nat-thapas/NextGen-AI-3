import fs from 'node:fs/promises';
import { join } from 'node:path';

import { error } from '@sveltejs/kit';

import { env } from '$env/dynamic/private';

import { shouldDispositionInline, toFileNameSafe } from '$lib/files';
import { getFile } from '$lib/server/db/services/files';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const idName = params.idName;
	let dotIndex = idName.lastIndexOf('.');
	if (dotIndex === -1) {
		dotIndex = idName.length;
	}
	const id = idName.slice(0, dotIndex);

	const file = await getFile(id);

	if (!file) {
		error(404, {
			message: 'Not Found'
		});
	}

	const path = join(env.FILE_STORAGE_PATH, file.id + file.extension);

	const dispositionInline = shouldDispositionInline(file.mimeType);

	try {
		return new Response(await fs.readFile(path), {
			headers: {
				'Cache-Control': 'public, max-age=31536000, immutable',
				'Content-Type': file.mimeType,
				'Content-Disposition': `${dispositionInline ? 'inline' : 'attachment'}; filename="${toFileNameSafe(idName)}"`
			}
		});
	} catch {
		error(404, {
			message: 'Not Found'
		});
	}
};
