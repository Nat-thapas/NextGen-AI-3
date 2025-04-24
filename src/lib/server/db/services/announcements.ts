import { desc, eq, sql } from 'drizzle-orm';

import { db } from '$lib/server/db';
import { announcements } from '$lib/server/db/schema';
import { generateId } from '$lib/token';

const createAnnouncementQuery = db
	.insert(announcements)
	.values({
		id: sql.placeholder('id'),
		title: sql.placeholder('title'),
		text: sql.placeholder('text'),
		html: sql.placeholder('html')
	})
	.prepare('create_announcement');

const getAnnouncementsQuery = db.query.announcements
	.findMany({
		columns: {
			authorId: false,
			text: false,
			html: false
		},
		limit: sql.placeholder('limit'),
		offset: sql.placeholder('offset'),
		orderBy: [desc(announcements.createdAt)]
	})
	.prepare('get_announcements');

const getAnnouncementQuery = db.query.announcements
	.findFirst({
		columns: {
			authorId: false,
			text: false
		},
		where: eq(announcements.id, sql.placeholder('id'))
	})
	.prepare('get_announcement');

export async function createAnnouncement(data: {
	id?: string;
	title: string;
	text: string;
	html: string;
}): Promise<ReturnType<typeof createAnnouncementQuery.execute>> {
	data.id ??= generateId();
	return createAnnouncementQuery.execute(data);
}

export async function getAnnouncements(options?: {
	limit?: number;
	offset?: number;
}): Promise<ReturnType<typeof getAnnouncementsQuery.execute>> {
	return getAnnouncementsQuery.execute({
		limit: options?.limit ?? 3,
		offset: options?.offset ?? 0
	});
}

export async function getAnnouncement(
	id: string
): Promise<ReturnType<typeof getAnnouncementQuery.execute>> {
	return getAnnouncementQuery.execute({ id });
}
