import { ResponseError } from '$lib/fetch-json';

export function getErrorMessage(err: unknown): string {
	if (err instanceof Error) {
		return err.message ? String(err.message) : 'Unknown error';
	}
	if (err instanceof ResponseError) {
		if (err.message instanceof Array) {
			if (err.message.length > 0) {
				return err.message.join(', ');
			}
			return 'Unknown error';
		}
		return err.message ? String(err.message) : 'Unknown error';
	}
	if (err instanceof Object) {
		if ('message' in err) {
			if (err.message instanceof Array) {
				if (err.message.length > 0) {
					return err.message.join(', ');
				}
				return 'Unknown error';
			}
			return err.message ? String(err.message) : 'Unknown error';
		}
		if ('messages' in err) {
			if (err.messages instanceof Array) {
				if (err.messages.length > 0) {
					return err.messages.join(', ');
				}
				return 'Unknown error';
			}
			return err.messages ? String(err.messages) : 'Unknown error';
		}
	}
	return 'Unknown error';
}
