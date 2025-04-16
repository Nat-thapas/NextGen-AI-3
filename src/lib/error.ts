export function getErrorMessage(error: App.Error | { message: string }): string {
	return error.message || 'Unknown error';
}
