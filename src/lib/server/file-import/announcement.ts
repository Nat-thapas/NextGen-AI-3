import fs from 'node:fs/promises';
import { join } from 'node:path';

import mimeTypes from 'mime-types';
import unzipper from 'unzipper';

import { base } from '$app/paths';
import { env } from '$env/dynamic/private';

import { getExtension } from '$lib/files';
import { renderMarkdown } from '$lib/markdown';
import { createFileWithReferenceReturning } from '$lib/server/db/services/files';
import { generateId } from '$lib/token';

import { createAnnouncement } from '../db/services/announcements';
import { updateAssets } from './update-assets';

export async function importAnnouncement(
	authorId: string,
	title: string,
	file: File
): Promise<void> {
	const archive = await unzipper.Open.buffer(Buffer.from(await file.arrayBuffer()));

	const id = generateId();
	let markdown = '';
	const assets: Record<string, string> = {};

	for (const compressed of archive.files) {
		if (compressed.type === 'File') {
			if (/^(?:[^/]*?)\.md/.test(compressed.path)) {
				if (markdown) {
					throw Error('Multiple markdown file in root directory detected');
				}
				markdown = (await compressed.buffer()).toString();
			} else {
				const mimeType = mimeTypes.lookup(compressed.path) || 'application/octet-stream';
				const extension = getExtension(compressed.path, mimeType);
				const file = (
					await createFileWithReferenceReturning({
						size: compressed.uncompressedSize,
						mimeType,
						extension,
						referenceId: id
					})
				)[0];
				await fs.writeFile(join(env.FILE_STORAGE_PATH, file.storedName), compressed.stream());
				assets[compressed.path] = `${base}/api/public/files/${file.id}/file${extension}`;
			}
		}
	}

	if (!markdown) {
		throw Error('No markdown file detected');
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
