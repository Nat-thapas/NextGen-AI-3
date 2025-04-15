import base64url from 'base64url';

export function generateTuid(): string {
	const bytes = new Uint8Array(12);
	crypto.getRandomValues(bytes);
	return base64url(String.fromCharCode(...bytes));
}
