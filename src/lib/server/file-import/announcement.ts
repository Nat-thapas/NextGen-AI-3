import fs from 'node:fs/promises';
import { join } from 'node:path';

import mimeTypes from 'mime-types';
import sharp from 'sharp';
import unzipper from 'unzipper';

import { base } from '$app/paths';
import { env } from '$env/dynamic/private';

import { configConstants } from '$lib/config-constants';
import { getExtension } from '$lib/files';
import { renderMarkdown } from '$lib/markdown';
import { createAnnouncementWithId } from '$lib/server/db/services/announcements';
import {
	createFileReturning,
	deleteFilesByReferenceReturning
} from '$lib/server/db/services/files';
import { generateSuid } from '$lib/server/db/suid';
import { updateAssets } from '$lib/server/file-import/update-assets';

export async function importAnnouncement(title: string, file: File): Promise<void> {
	const archive = await unzipper.Open.buffer(Buffer.from(await file.arrayBuffer()));

	const id = generateSuid();
	let markdown = '';
	const assets: Record<string, string> = {};

	try {
		for (const compressed of archive.files) {
			if (compressed.type !== 'File') continue;

			if (/^(?:[^/]*?)\.md$/.test(compressed.path)) {
				if (markdown) {
					throw Error('Multiple markdown files found in root directory');
				}
				markdown = (await compressed.buffer()).toString();
			} else {
				let buffer = await compressed.buffer();
				let size = buffer.length;
				let mimeType = mimeTypes.lookup(compressed.path) || 'application/octet-stream';
				let extension = getExtension(compressed.path, mimeType);

				if (
					configConstants.assets.enableImageOptimization &&
					[
						'image/bmp',
						'image/vnd.microsoft.icon',
						'image/jpeg',
						'image/png',
						'image/tiff',
						'image/webp'
					].includes(mimeType)
				) {
					try {
						buffer = await sharp(buffer, {
							autoOrient: true
						})
							.avif({ quality: 75, effort: 7, chromaSubsampling: '4:4:4' })
							.toBuffer();
						size = buffer.length;
						mimeType = 'image/avif';
						extension = '.avif';
					} catch {} // eslint-disable-line no-empty
				}

				const file = await createFileReturning({
					size,
					mimeType,
					extension,
					referenceId: id
				});
				await fs.writeFile(join(env.FILE_STORAGE_PATH, file.id + file.extension), buffer);
				assets[compressed.path] = `${base}/api/files/${file.id + file.extension}`;
			}
		}

		if (!markdown) {
			throw Error('No markdown file found');
		}
	} catch (err) {
		const assets = await deleteFilesByReferenceReturning(id);
		await Promise.allSettled(
			assets.map((file) => fs.unlink(join(env.FILE_STORAGE_PATH, file.id + file.extension)))
		);

		throw err;
	}

	markdown = updateAssets(markdown, assets);

	await createAnnouncementWithId({
		id,
		title,
		markdown,
		html: renderMarkdown(markdown)
	});
}
