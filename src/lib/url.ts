import { env } from '$env/dynamic/public';

export type ParamValue = string | number | null | undefined;

export function setSearchParams(url: URL, params: Record<string, ParamValue>): URL;
export function setSearchParams(urlString: string, params: Record<string, ParamValue>): string;
export function setSearchParams(
	urlOrUrlString: string | URL,
	params: Record<string, ParamValue>
): string | URL {
	const isInputUrl = urlOrUrlString instanceof URL;
	const isInputAbsoluteUrlString = isInputUrl
		? false
		: urlOrUrlString.startsWith('http://') || urlOrUrlString.startsWith('https://');
	const url = isInputUrl ? new URL(urlOrUrlString) : new URL(urlOrUrlString, env.PUBLIC_ORIGIN);

	for (const [key, value] of Object.entries(params)) {
		if (value === undefined || value === null) {
			url.searchParams.delete(key);
		} else {
			url.searchParams.set(key, value.toString());
		}
	}

	if (isInputUrl) {
		return url;
	}

	if (isInputAbsoluteUrlString) {
		return url.toString();
	}

	return url.pathname + url.search + url.hash;
}
