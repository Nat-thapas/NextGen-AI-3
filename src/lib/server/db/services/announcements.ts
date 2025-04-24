/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { desc, eq, sql } from 'drizzle-orm';

import { db } from '$lib/server/db';
import { announcements } from '$lib/server/db/schema';
import { generateId } from '$lib/token';

const createAnnouncementQuery = db
	.insert(announcements)
	.values({
		id: sql.placeholder('id'),
		authorId: sql.placeholder('authorId'),
		title: sql.placeholder('title'),
		markdown: sql.placeholder('markdown'),
		html: sql.placeholder('html')
	})
	.prepare('create_announcement');

const getAnnouncementsQuery = db.query.announcements
	.findMany({
		columns: {
			authorId: false,
			markdown: false,
			html: false
		},
		limit: sql.placeholder('limit'),
		orderBy: [desc(announcements.createdAt)]
	})
	.prepare('get_announcements');

const getAnnouncementQuery = db.query.announcements
	.findFirst({
		columns: {
			authorId: false,
			markdown: false
		},
		where: eq(announcements.id, sql.placeholder('id'))
	})
	.prepare('get_announcement');

export async function createAnnouncement(data: {
	id?: string;
	authorId: string;
	title: string;
	markdown: string;
	html: string;
}) {
	data.id ??= generateId();
	return createAnnouncementQuery.execute(data);
}

export async function getAnnouncements(limit: number = 3) {
	return getAnnouncementsQuery.execute({ limit });
}

export async function getAnnouncement(id: string) {
	return getAnnouncementQuery.execute({ id });
}
