import { env } from '$env/dynamic/public';

export function setToastParams(
	originalUrl: string | URL,
	message: string,
	description?: string,
	type?: 'success' | 'info' | 'warning' | 'error'
): string {
	let isAbsoluteUrl: boolean;
	let url: URL;
	if (originalUrl instanceof URL) {
		isAbsoluteUrl = false;
		url = originalUrl;
	} else {
		isAbsoluteUrl = originalUrl.startsWith('http://') || originalUrl.startsWith('https://');
		url = new URL(originalUrl, env.PUBLIC_ORIGIN);
	}

	url.searchParams.set('toast-message', encodeURIComponent(message));
	if (description !== undefined) {
		url.searchParams.set('toast-description', encodeURIComponent(description));
	}
	if (type !== undefined) {
		url.searchParams.set('toast-type', type);
	}

	return isAbsoluteUrl ? url.toString() : url.pathname + url.search + url.hash;
}
