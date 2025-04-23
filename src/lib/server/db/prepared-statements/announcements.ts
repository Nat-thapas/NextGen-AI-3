import { desc, eq, sql } from 'drizzle-orm';

import { db } from '$lib/server/db';
import { announcements } from '$lib/server/db/schema';

export const getAnnouncements = db.query.announcements
	.findMany({
		columns: {
			text: false,
			html: false
		},
		limit: sql.placeholder<string>('limit'),
		offset: sql.placeholder<string>('offset'),
		orderBy: [desc(announcements.createdAt)]
	})
	.prepare('get_announcements');

export const getAnnouncement = db.query.announcements
	.findFirst({
		columns: {
			text: false
		},
		where: eq(announcements.id, sql.placeholder('id'))
	})
	.prepare('get_announcement');
