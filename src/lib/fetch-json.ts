import { env } from '$env/dynamic/public';

import { HttpMethod } from '$lib/enums';

export class ResponseError {
	status: number;
	message?: string | string[];
	errors?: Record<
		string,
		string | string[] | number | Record<string | number, string | string[] | number>
	>[];

	constructor(
		status: number,
		message?: string | string[],
		errors?: Record<
			string,
			string | string[] | number | Record<string | number, string | string[] | number>
		>[]
	) {
		this.status = status;
		this.message = message ?? 'Unknown error';
		this.errors = errors ?? [];
	}
}

type ParamValue = string | number | null | undefined;

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
	const url = isInputUrl ? urlOrUrlString : new URL(urlOrUrlString, env.PUBLIC_ORIGIN);

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

export class FetchJson {
	private readonly fetch: (
		input: RequestInfo | URL,
		init?: RequestInit | undefined
	) => Promise<Response>;
	private readonly baseUrl: string;
	private bearerToken: string | null;

	constructor(
		fetch: (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>,
		baseUrl: string,
		bearerToken: string | null = null
	) {
		this.fetch = fetch;
		if (baseUrl.endsWith('/')) {
			baseUrl = baseUrl.slice(0, -1);
		}
		this.baseUrl = baseUrl;
		this.bearerToken = bearerToken;
	}

	setBearerToken(bearerToken: string | null): void {
		this.bearerToken = bearerToken;
	}

	private addHeaders(headers?: Record<string, string>): Record<string, string> {
		const baseHeaders: Record<string, string> = {
			Accept: 'application/json'
		};
		if (this.bearerToken) {
			baseHeaders.Authorization = `Bearer ${this.bearerToken}`;
		}
		return {
			...baseHeaders,
			...headers
		};
	}

	private normalizePath(path: string): string {
		if (!path.startsWith('/')) {
			path = '/' + path;
		}
		return path;
	}

	async get<T>(
		path: string,
		params: Record<string, ParamValue> = {},
		headers: Record<string, string> = {}
	): Promise<T> {
		path = this.normalizePath(path);

		const url = setSearchParams(path, params);

		const response = await this.fetch(url, {
			headers: this.addHeaders(headers)
		});

		let responseData;
		try {
			responseData = await response.json();
		} catch {
			try {
				responseData = { text: await response.text() };
			} catch {
				responseData = null;
			}
		}

		if (!response.ok) {
			throw new ResponseError(response.status, responseData?.message, responseData?.errors);
		}

		return responseData;
	}

	private async postLike<T>(
		method: HttpMethod.POST | HttpMethod.PUT | HttpMethod.PATCH | HttpMethod.DELETE,
		path: string,
		body: Record<string, unknown> = {},
		headers: Record<string, string> = {}
	): Promise<T> {
		path = this.normalizePath(path);

		const url = this.baseUrl + path;

		const isBodyEmpty = Object.keys(body).length === 0 && body.constructor === Object;

		const fetchInit: RequestInit = {
			method
		};

		if (!isBodyEmpty) {
			fetchInit.headers = this.addHeaders({
				'Content-Type': 'application/json',
				...headers
			});

			fetchInit.body = JSON.stringify(body);
		} else {
			fetchInit.headers = this.addHeaders(headers);
		}

		const response = await this.fetch(url, fetchInit);

		let responseData;
		try {
			responseData = await response.json();
		} catch {
			try {
				responseData = { text: await response.text() };
			} catch {
				responseData = null;
			}
		}

		if (!response.ok) {
			throw new ResponseError(response.status, responseData?.message, responseData?.errors);
		}

		return responseData;
	}

	async post<T>(
		path: string,
		body: Record<string, unknown> = {},
		headers: Record<string, string> = {}
	): Promise<T> {
		return this.postLike<T>(HttpMethod.POST, path, body, headers);
	}

	async put<T>(
		path: string,
		body: Record<string, unknown> = {},
		headers: Record<string, string> = {}
	): Promise<T> {
		return this.postLike<T>(HttpMethod.PUT, path, body, headers);
	}

	async patch<T>(
		path: string,
		body: Record<string, unknown> = {},
		headers: Record<string, string> = {}
	): Promise<T> {
		return this.postLike<T>(HttpMethod.PATCH, path, body, headers);
	}

	async delete<T>(path: string, headers: Record<string, string> = {}): Promise<T> {
		return this.postLike<T>(HttpMethod.DELETE, path, {}, headers);
	}
}
