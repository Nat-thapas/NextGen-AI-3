import fs from 'node:fs/promises';
import { join } from 'node:path';

import mimeTypes from 'mime-types';
import unzipper from 'unzipper';

import { base } from '$app/paths';
import { env } from '$env/dynamic/private';

import { getExtension } from '$lib/files';
import { renderMarkdown } from '$lib/markdown';
import { createAnnouncement } from '$lib/server/db/services/announcements';
import {
	createFileWithReferenceReturning,
	deleteFilesByReferenceReturning
} from '$lib/server/db/services/files';
import { updateAssets } from '$lib/server/file-import/update-assets';
import { generateId } from '$lib/token';

export async function importAnnouncement(
	authorId: string,
	title: string,
	file: File
): Promise<void> {
	const archive = await unzipper.Open.buffer(Buffer.from(await file.arrayBuffer()));

	const id = generateId();
	let markdown = '';
	const assets: Record<string, string> = {};

	try {
		for (const compressed of archive.files) {
			if (compressed.type !== 'File') continue;

			if (/^(?:[^/]*?)\.md/.test(compressed.path)) {
				if (markdown) {
					throw Error('Multiple markdown files found in root directory');
				}
				markdown = (await compressed.buffer()).toString();
			} else {
				const mimeType = mimeTypes.lookup(compressed.path) || 'application/octet-stream';
				const extension = getExtension(compressed.path, mimeType);
				const file = await createFileWithReferenceReturning({
					size: compressed.uncompressedSize,
					mimeType,
					extension,
					referenceId: id
				});
				await fs.writeFile(join(env.FILE_STORAGE_PATH, file.storedName), compressed.stream());
				assets[compressed.path] = `${base}/api/public/files/${file.storedName}`;
			}
		}

		if (!markdown) {
			throw Error('No markdown file found');
		}
	} catch (err) {
		const assets = await deleteFilesByReferenceReturning(id);
		await Promise.allSettled(
			assets.map((file) => fs.unlink(join(env.FILE_STORAGE_PATH, file.storedName)))
		);

		throw err;
	}

	markdown = updateAssets(markdown, assets);

	await createAnnouncement({
		id,
		authorId,
		title,
		markdown,
		html: renderMarkdown(markdown)
	});
}
