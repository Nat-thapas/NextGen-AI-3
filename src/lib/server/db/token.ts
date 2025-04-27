import { configConstants } from '$lib/config-constants';
import { base64UrlEncode } from '$lib/server/db/base64url';

export function generateToken(entropy?: number): string {
	entropy ??= configConstants.sessions.tokenEntropy;
	const bytesCount = Math.ceil(entropy / 8);
	const bytes = new Uint8Array(bytesCount);
	crypto.getRandomValues(bytes);
	return base64UrlEncode(Buffer.from(bytes));
}
