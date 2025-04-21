export function formatDate(date: Date): string {
	return date.toLocaleDateString('th-TH', {
		dateStyle: 'medium'
	});
}

export function formatTime(date: Date): string {
	return date.toLocaleTimeString('th-TH', {
		timeStyle: 'medium'
	});
}

export function formatDateTime(date: Date): string {
	return date.toLocaleString('th-TH', {
		dateStyle: 'medium',
		timeStyle: 'medium'
	});
}

/**
 * Take in a time duration in number format and a string representing that time duration
 * in natural language
 * @param duration The time duration in seconds
 * @returns A string representing the duration in natural language
 */
export function formatDuration(duration: number): string {
	const days = Math.floor(duration / (24 * 60 * 60));
	const hours = Math.floor((duration % (24 * 60 * 60)) / (60 * 60));
	const minutes = Math.floor((duration % (60 * 60)) / 60);
	const seconds = duration % 60;

	const parts: string[] = [];
	if (days) parts.push(`${days} day${days > 1 ? 's' : ''}`);
	if (hours) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
	if (minutes) parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
	if (seconds) parts.push(`${seconds} second${seconds > 1 ? 's' : ''}`);

	if (parts.length === 0) return '0 seconds';

	if (parts.length > 1) {
		const lastPart = parts.pop();
		return `${parts.join(', ')} and ${lastPart}`;
	}

	return parts.join('');
}

export function utcNow(): Date {
	return new Date(Date.now());
}

export function getSecondsSince(date: Date): number {
	return (Date.now() - date.getTime()) / 1000;
}
