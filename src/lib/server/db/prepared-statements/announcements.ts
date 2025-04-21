import { count, desc, sql } from 'drizzle-orm';

import { db } from '$lib/server/db';
import { announcements } from '$lib/server/db/schema';

export const countAnnouncements = db
	.select({ count: count() })
	.from(announcements)
	.prepare('count_announcements');

export const getAnnouncements = db.query.announcements
	.findMany({
		columns: {
			authorId: false
		},
		limit: sql.placeholder<string>('limit'),
		offset: sql.placeholder<string>('offset'),
		orderBy: [desc(announcements.createdAt)]
	})
	.prepare('get_announcements');
