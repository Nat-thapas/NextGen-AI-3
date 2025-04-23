import { eq, sql } from 'drizzle-orm';

import { db } from '$lib/server/db';
import { files } from '$lib/server/db/schema';

export const createFile = db
	.insert(files)
	.values({
		size: sql`${sql.placeholder<string>('size')}`,
		mime: sql`${sql.placeholder<string>('mime')}`,
		extension: sql`${sql.placeholder<string>('extension')}`
	})
	.prepare('create-file');

export const createFileReturning = db
	.insert(files)
	.values({
		size: sql`${sql.placeholder<string>('size')}`,
		mime: sql`${sql.placeholder<string>('mime')}`,
		extension: sql`${sql.placeholder<string>('extension')}`
	})
	.returning()
	.prepare('create-file-returning');

export const getFile = db.query.files
	.findFirst({
		where: eq(files.id, sql.placeholder<string>('id'))
	})
	.prepare('get_file');
