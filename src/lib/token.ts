import base64url from 'base64url';

import { configConstants } from '$lib/config-constants';

export function generateToken(entropy?: number): string {
	entropy ??= configConstants.entropy.token;
	const bytesCount = Math.ceil(entropy / 8);
	const bytes = new Uint8Array(bytesCount);
	crypto.getRandomValues(bytes);
	return base64url(Buffer.from(bytes));
}

export function generateId(): string {
	return generateToken(configConstants.entropy.id);
}
