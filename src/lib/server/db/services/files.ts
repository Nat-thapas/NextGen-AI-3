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
	.prepare('create_file');

const createFileWithReferenceQuery = db
	.insert(files)
	.values({
		id: sql.placeholder('id'),
		size: sql.placeholder('size'),
		mimeType: sql.placeholder('mimeType'),
		extension: sql.placeholder('extension'),
		referenceId: sql.placeholder('referenceId')
	})
	.prepare('create_file_with_reference');

const createFileReturningQuery = db
	.insert(files)
	.values({
		id: sql.placeholder('id'),
		size: sql.placeholder('size'),
		mimeType: sql.placeholder('mimeType'),
		extension: sql.placeholder('extension')
	})
	.returning()
	.prepare('create_file_returning');

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
	.prepare('create_file_with_reference_returning');

const getFileQuery = db.query.files
	.findFirst({
		where: eq(files.id, sql.placeholder('id'))
	})
	.prepare('get_file');

const deleteFileQuery = db
	.delete(files)
	.where(eq(files.id, sql.placeholder('id')))
	.prepare('delete_file');

const deleteFileReturningQuery = db
	.delete(files)
	.where(eq(files.id, sql.placeholder('id')))
	.returning()
	.prepare('delete_file_returning');

const deleteFilesByReferenceReturningQuery = db
	.delete(files)
	.where(eq(files.referenceId, sql.placeholder('referenceId')))
	.returning()
	.prepare('delete_file_reference_returning');

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

export async function getFile(id: string) {
	return getFileQuery.execute({ id });
}

export async function deleteFile(id: string) {
	return deleteFileQuery.execute({ id });
}

export async function deleteFileReturning(id: string) {
	return (await deleteFileReturningQuery.execute({ id }))[0];
}

export async function deleteFilesByReferenceReturning(referenceId: string) {
	return deleteFilesByReferenceReturningQuery.execute({ referenceId });
}
