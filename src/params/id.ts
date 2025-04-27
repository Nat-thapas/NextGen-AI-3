export function match(value: string): boolean {
	return /^[0-9A-Za-z_-]{22}$/.test(value);
}
