export function match(value: string): boolean {
	return /^[0-9]{1,15}$/.test(value);
}
