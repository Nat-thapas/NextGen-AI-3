import { eq, sql } from 'drizzle-orm';

import { db } from '$lib/server/db';
import { files } from '$lib/server/db/schema';
import { generateId } from '$lib/token';

export const createFile = db
	.insert(files)
	.values({
		size: sql`${sql.placeholder<string>('size')}`,
		mimeType: sql`${sql.placeholder<string>('mimeType')}`,
		extension: sql`${sql.placeholder<string>('extension')}`
	})
	.prepare('create-file');

export const createFileWithReference = db
	.insert(files)
	.values({
		size: sql`${sql.placeholder<string>('size')}`,
		mimeType: sql`${sql.placeholder<string>('mimeType')}`,
		extension: sql`${sql.placeholder<string>('extension')}`,
		referenceId: sql`${sql.placeholder<string>('referenceId')}`
	})
	.prepare('create-file-with-reference');

export const createFileReturning = db
	.insert(files)
	.values({
		size: sql`${sql.placeholder<string>('size')}`,
		mimeType: sql`${sql.placeholder<string>('mimeType')}`,
		extension: sql`${sql.placeholder<string>('extension')}`
	})
	.returning()
	.prepare('create-file-returning');

export const createFileWithReferenceReturning = db
	.insert(files)
	.values({
		size: sql`${sql.placeholder<string>('size')}`,
		mimeType: sql`${sql.placeholder<string>('mimeType')}`,
		extension: sql`${sql.placeholder<string>('extension')}`,
		referenceId: sql`${sql.placeholder<string>('referenceId')}`
	})
	.returning();
// .prepare('create-file-with-reference-returning');
// TODO: find out why prepare doesn't work in this case

export const getFile = db.query.files
	.findFirst({
		where: eq(files.id, sql.placeholder<string>('id'))
	})
	.prepare('get_file');
