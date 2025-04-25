import { setSearchParams } from '$lib/url';

export function setToastParams(
	url: URL,
	message: string,
	description?: string,
	type?: 'success' | 'info' | 'warning' | 'error'
): URL;
export function setToastParams(
	urlString: string,
	message: string,
	description?: string,
	type?: 'success' | 'info' | 'warning' | 'error'
): string;
export function setToastParams(
	urlOrUrlString: string | URL,
	message: string,
	description?: string,
	type?: 'success' | 'info' | 'warning' | 'error'
): string | URL {
	// Yes, it does the same thing in both cases.
	// It's to make the types work
	if (urlOrUrlString instanceof URL) {
		return setSearchParams(urlOrUrlString, {
			'toast-message': message,
			'toast-description': description,
			'toast-type': type
		});
	} else {
		return setSearchParams(urlOrUrlString, {
			'toast-message': message,
			'toast-description': description,
			'toast-type': type
		});
	}
}
