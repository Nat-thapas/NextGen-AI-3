import { json } from '@sveltejs/kit';

import { utcNow } from '$lib/datetime';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	return json({ now: utcNow() });
};
