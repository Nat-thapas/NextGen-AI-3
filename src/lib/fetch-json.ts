import { getErrorMessage } from '$lib/error';
import { setSearchParams, type ParamValue } from '$lib/url';

type HttpMethod =
	| 'GET'
	| 'HEAD'
	| 'POST'
	| 'PUT'
	| 'DELETE'
	| 'CONNECT'
	| 'OPTIONS'
	| 'TRACE'
	| 'PATCH';

const HttpMethod = {
	GET: 'GET',
	HEAD: 'HEAD',
	POST: 'POST',
	PUT: 'PUT',
	DELETE: 'DELETE',
	CONNECT: 'CONNECT',
	OPTIONS: 'OPTIONS',
	TRACE: 'TRACE',
	PATCH: 'PATCH'
} as const;

export class ResponseError {
	status: number;
	error: unknown;
	message?: string | string[];
	errors?: Record<
		string,
		string | string[] | number | Record<string | number, string | string[] | number>
	>[];

	constructor(
		status: number,
		error?: unknown,
		message?: string | string[],
		errors?: Record<
			string,
			string | string[] | number | Record<string | number, string | string[] | number>
		>[]
	) {
		this.status = status;
		this.error = error;
		this.message = message ?? 'Unknown error';
		this.errors = errors ?? [];
	}
}

export class FetchJson {
	private readonly fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
	private readonly baseUrl: string;
	private bearerToken: string | null;

	constructor(
		fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>,
		baseUrl: string = '',
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
		if (this.baseUrl && !path.startsWith('/')) {
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

		const url = setSearchParams(this.baseUrl + path, params);

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
			throw new ResponseError(response.status, responseData, getErrorMessage(responseData));
		}

		return responseData;
	}

	private async postLike<T>(
		method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
		path: string,
		body: string | Record<string, string> = {},
		headers: Record<string, string> = {}
	): Promise<T> {
		path = this.normalizePath(path);

		const url = this.baseUrl + path;

		const isBodyEmpty =
			typeof body === 'string' || body instanceof String
				? !!body
				: Object.keys(body).length === 0 && body.constructor === Object;

		const fetchInit: RequestInit = {
			method
		};

		if (!isBodyEmpty) {
			fetchInit.headers = this.addHeaders({
				'Content-Type': 'application/json; charset=utf-8',
				...headers
			});

			if (fetchInit.headers['Content-Type'].startsWith('application/json')) {
				fetchInit.body = JSON.stringify(body);
			} else if (
				fetchInit.headers['Content-Type'].startsWith('application/x-www-form-urlencoded')
			) {
				fetchInit.body = new URLSearchParams(body);
			} else {
				fetchInit.body = String(body);
			}
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
			throw new ResponseError(response.status, responseData, getErrorMessage(responseData));
		}

		return responseData;
	}

	async post<T>(
		path: string,
		body: Record<string, string> = {},
		headers: Record<string, string> = {}
	): Promise<T> {
		return this.postLike<T>(HttpMethod.POST, path, body, headers);
	}

	async put<T>(
		path: string,
		body: Record<string, string> = {},
		headers: Record<string, string> = {}
	): Promise<T> {
		return this.postLike<T>(HttpMethod.PUT, path, body, headers);
	}

	async patch<T>(
		path: string,
		body: Record<string, string> = {},
		headers: Record<string, string> = {}
	): Promise<T> {
		return this.postLike<T>(HttpMethod.PATCH, path, body, headers);
	}

	async delete<T>(path: string, headers: Record<string, string> = {}): Promise<T> {
		return this.postLike<T>(HttpMethod.DELETE, path, {}, headers);
	}
}
