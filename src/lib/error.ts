import { ResponseError } from './fetch-json';

export function getErrorMessage(err: unknown): string {
	if (err instanceof Error) {
		return err.message || 'Unknown error';
	}
	if (err instanceof ResponseError) {
		if (err.message instanceof Array) {
			if (err.message.length > 0) {
				return err.message.join(', ');
			}
			return 'Unknown error';
		}
		return err.message || 'Unknown error';
	}
	return 'Unknown error';
}
