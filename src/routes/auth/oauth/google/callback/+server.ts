import { redirect } from '@sveltejs/kit';
import { jwtDecode, type JwtPayload } from 'jwt-decode';

import { base } from '$app/paths';
import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';

import { configConstants } from '$lib/config-constants';
import { roles } from '$lib/enums';
import { FetchJson } from '$lib/fetch-json';
import { createSession } from '$lib/server/db/services/sessions';
import {
	createUserReturning,
	getStudentcount,
	getUserByEmail
} from '$lib/server/db/services/users';
import { generateToken } from '$lib/server/db/token';
import type { User } from '$lib/server/interfaces/user';
import { setToastParams } from '$lib/toast';

import type { RequestEvent, RequestHandler } from './$types';

interface TokenResponse {
	access_token: string;
	expires_in: number;
	id_token: string;
	scope: string;
	token_type: string;
}

interface TokenData extends JwtPayload {
	iss: string;
	azp: string;
	aud: string;
	sub: string;
	iat: number;
	exp: number;
	at_hash: string;
	email: string;
	email_verified: boolean;
	hd?: string;
	nonce?: string;
	name?: string;
	given_name?: string;
	family_name?: string;
	locale?: string;
	profile?: string;
	picture?: string;
}

async function authenticate(event: RequestEvent): Promise<{ user: User; next: string }> {
	const returnedState = event.url.searchParams.get('state');
	const expectedState = event.cookies.get('state');
	event.cookies.delete('state', configConstants.cookie.options);
	if (!returnedState || !expectedState || returnedState !== expectedState) {
		redirect(
			303,
			setToastParams(
				`${base}/`,
				'ไม่สามารถยืนยันที่มาของการเข้าสู่ระบบได้ กรุณาลองเข้าสู่ระบบใหม่',
				'Error: state parameter mismatch',
				'error'
			)
		);
	}

	const state = returnedState;
	const delimiterIndex = state.indexOf(':');

	let next: string = '';

	if (delimiterIndex !== -1) {
		next = state.slice(delimiterIndex + 1);
	}

	next ||= `${base}/`;
	if (!next.startsWith('/')) {
		next = `/${next}`;
	}

	const code = event.url.searchParams.get('code');
	if (!code) {
		redirect(
			303,
			setToastParams(
				`${base}/`,
				'URL จาก Google ไม่มีรหัสยืนยัน กรุณาลองเข้าสู่ระบบใหม่',
				'Error: URL missing code parameter',
				'error'
			)
		);
	}

	let tokenData: TokenData;

	try {
		const fetchJson = new FetchJson(fetch, 'https://oauth2.googleapis.com');
		const response = await fetchJson.post<TokenResponse>(
			'/token',
			{
				code,
				client_id: env.OAUTH_GOOGLE_CLIENT_ID,
				client_secret: env.OAUTH_GOOGLE_CLIENT_SECRET,
				redirect_uri: `${publicEnv.PUBLIC_ORIGIN}${base}/auth/oauth/google/callback`,
				grant_type: 'authorization_code'
			},
			{
				'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
			}
		);

		tokenData = jwtDecode<TokenData>(response.id_token);
	} catch (err) {
		console.error('An error occurred in Google code exchange flow');
		console.error(err);
		redirect(
			303,
			setToastParams(
				`${base}/`,
				'เกิดข้อผิดพลาดระหว่างระหว่างการยืนยันรหัสกับ Google กรุณาลองเข้าสู่ระบบใหม่',
				'Error: Code exchange failure',
				'error'
			)
		);
	}

	let user: User | undefined = await getUserByEmail(tokenData.email);

	if (!user) {
		if (!tokenData.email.endsWith('@' + env.STAFF_EMAIL_SERVER)) {
			if (new Date() > new Date(publicEnv.PUBLIC_DISABLE_SIGNUP_AT)) {
				redirect(
					303,
					setToastParams(`${base}/`, 'ขออภัย ขณะนี้เลยเวลารับสมัครแล้ว', undefined, 'error')
				);
			}
			if ((await getStudentcount()) >= parseInt(env.STUDENT_LIMIT)) {
				redirect(
					303,
					setToastParams(
						`${base}/`,
						'ขออภัย ขณะนี้มีผู้สมัครครบตามจำนวนที่กำหนดแล้ว',
						undefined,
						'error'
					)
				);
			}
		}

		if (tokenData.email.endsWith('@' + env.STAFF_EMAIL_SERVER)) {
			user = await createUserReturning(roles.staff, tokenData.email);
		} else {
			user = await createUserReturning(roles.student, tokenData.email);
		}
	}

	return { user, next };
}

export const GET: RequestHandler = async (event) => {
	const authenticationData = await authenticate(event);
	const user = authenticationData.user;
	let next = authenticationData.next;

	let ip = '0.0.0.0';
	try {
		ip = event.getClientAddress();
	} catch {} // eslint-disable-line no-empty
	const userAgent = event.request.headers.get('User-Agent') ?? '';

	const token = generateToken();
	await createSession({
		token,
		userId: user.id,
		firstLoginIp: ip,
		firstLoginUserAgent: userAgent,
		lastUseIp: ip,
		lastUseUserAgent: userAgent
	});

	event.cookies.set('token', token, configConstants.cookie.options);

	next ||= `${base}/`;
	if (!next.startsWith('/')) {
		next = '/' + next;
	}

	if (!user.registered) {
		redirect(
			303,
			setToastParams(
				`${base}/auth/register?next=${encodeURIComponent(next)}`,
				'Please fill the form to register your account',
				undefined,
				'info'
			)
		);
	}

	redirect(303, setToastParams(next, 'Login successful', undefined, 'success'));
};
