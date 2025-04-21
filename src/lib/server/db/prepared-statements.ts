import { eq, sql } from 'drizzle-orm';

import { db } from '$lib/server/db';
import { sessions } from '$lib/server/db/schema';

export const getSessionFromToken = db.query.sessions
	.findFirst({
		where: eq(sessions.token, sql.placeholder('token')),
		with: {
			user: true
		}
	})
	.prepare('get_session_from_token');
