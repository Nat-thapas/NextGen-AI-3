/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { eq, sql } from 'drizzle-orm';

import { db } from '$lib/server/db';
import { files } from '$lib/server/db/schema';
import { generateId } from '$lib/token';

const createFileQuery = db
	.insert(files)
	.values({
		id: sql.placeholder('id'),
		size: sql.placeholder('size'),
		mimeType: sql.placeholder('mimeType'),
		extension: sql.placeholder('extension')
	})
	.prepare('create-file');

const createFileWithReferenceQuery = db
	.insert(files)
	.values({
		id: sql.placeholder('id'),
		size: sql.placeholder('size'),
		mimeType: sql.placeholder('mimeType'),
		extension: sql.placeholder('extension'),
		referenceId: sql.placeholder('referenceId')
	})
	.prepare('create-file-with-reference');

const createFileReturningQuery = db
	.insert(files)
	.values({
		id: sql.placeholder('id'),
		size: sql.placeholder('size'),
		mimeType: sql.placeholder('mimeType'),
		extension: sql.placeholder('extension')
	})
	.returning()
	.prepare('create-file-returning');

const createFileWithReferenceReturningQuery = db
	.insert(files)
	.values({
		id: sql.placeholder('id'),
		size: sql.placeholder('size'),
		mimeType: sql.placeholder('mimeType'),
		extension: sql.placeholder('extension'),
		referenceId: sql.placeholder('referenceId')
	})
	.returning()
	.prepare('create-file-with-reference-returning');

const getFileQuery = db.query.files
	.findFirst({
		where: eq(files.id, sql.placeholder('id'))
	})
	.prepare('get_file');

const deleteFileQuery = db
	.delete(files)
	.where(eq(files.id, sql.placeholder('id')))
	.prepare('delete_file');

export async function createFile(data: {
	id?: string;
	size: number;
	mimeType: string;
	extension: string;
}) {
	data.id ??= generateId();
	return createFileQuery.execute(data);
}

export async function createFileWithReference(data: {
	id?: string;
	size: number;
	mimeType: string;
	extension: string;
	referenceId: string;
}) {
	data.id ??= generateId();
	return createFileWithReferenceQuery.execute(data);
}

export async function createFileReturning(data: {
	id?: string;
	size: number;
	mimeType: string;
	extension: string;
}) {
	data.id ??= generateId();
	return (await createFileReturningQuery.execute(data))[0];
}

export async function createFileWithReferenceReturning(data: {
	id?: string;
	size: number;
	mimeType: string;
	extension: string;
	referenceId: string;
}) {
	data.id ??= generateId();
	return (await createFileWithReferenceReturningQuery.execute(data))[0];
}

export async function getFile(id: string): Promise<ReturnType<typeof getFileQuery.execute>> {
	return getFileQuery.execute({ id });
}

export async function deleteFile(id: string): Promise<ReturnType<typeof deleteFileQuery.execute>> {
	return deleteFileQuery.execute({ id });
}
