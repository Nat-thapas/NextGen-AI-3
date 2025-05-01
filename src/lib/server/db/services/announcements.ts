/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { desc, eq, sql } from 'drizzle-orm';

import { db } from '$lib/server/db';
import { announcements } from '$lib/server/db/schema';
import { suidToUuid } from '$lib/server/db/suid';

const createAnnouncementQuery = db
	.insert(announcements)
	.values({
		title: sql.placeholder('title'),
		markdown: sql.placeholder('markdown'),
		html: sql.placeholder('html')
	})
	.prepare('create_announcement');

const createAnnouncementWithIdQuery = db
	.insert(announcements)
	.values({
		id: sql.placeholder('id'),
		title: sql.placeholder('title'),
		markdown: sql.placeholder('markdown'),
		html: sql.placeholder('html')
	})
	.prepare('create_announcement_id');

const getAnnouncementQuery = db.query.announcements
	.findFirst({
		columns: {
			markdown: false
		},
		where: eq(announcements.id, sql.placeholder('id'))
	})
	.prepare('get_announcement');

const getAnnouncementsQuery = db.query.announcements
	.findMany({
		columns: {
			markdown: false,
			html: false
		},
		limit: sql.placeholder('limit'),
		orderBy: [desc(announcements.createdAt)]
	})
	.prepare('get_announcements');

export async function createAnnouncement(data: { title: string; markdown: string; html: string }) {
	return createAnnouncementQuery.execute(data);
}

export async function createAnnouncementWithId(data: {
	id: string;
	title: string;
	markdown: string;
	html: string;
}) {
	return createAnnouncementWithIdQuery.execute(data);
}

export async function getAnnouncement(id: string) {
	id = suidToUuid(id);
	return getAnnouncementQuery.execute({ id });
}

export async function getAnnouncements(limit: number = 3) {
	return getAnnouncementsQuery.execute({ limit });
}
