import { redirect } from '@sveltejs/kit';

import { base } from '$app/paths';
import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';

import { configConstants } from '$lib/config-constants';
import { generateToken } from '$lib/server/db/token';
import { setSearchParams } from '$lib/url';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => {
	let next = event.url.searchParams.get('next');
	next ||= `${base}/`;
	if (!next.startsWith('/')) {
		next = `/${next}`;
	}

	const nonce = generateToken(configConstants.auth.oauth.nonce.entropy);
	const stateRandom = generateToken(configConstants.auth.oauth.state.randomEntropy);
	const state = stateRandom + ':' + next;

	event.cookies.set('state', state, { ...configConstants.cookie.options, maxAge: 60 * 15 });

	redirect(
		303,
		setSearchParams('https://accounts.google.com/o/oauth2/v2/auth', {
			client_id: env.OAUTH_GOOGLE_CLIENT_ID,
			response_type: 'code',
			scope: env.OAUTH_GOOGLE_SCOPES,
			redirect_uri: `${publicEnv.PUBLIC_ORIGIN}${base}/auth/oauth/google/callback`,
			state,
			nonce
		})
	);
};
