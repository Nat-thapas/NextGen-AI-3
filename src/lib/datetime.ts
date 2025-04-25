export function formatDate(
	date: Date,
	options?: {
		locale?: string;
		dateStyle?: 'medium' | 'full' | 'long' | 'short';
		timeZone?: string;
	}
): string {
	options ??= {};
	options.locale ??= 'th-TH';
	options.dateStyle ??= 'medium';
	options.timeZone ??= 'Asia/Bangkok';
	return date.toLocaleDateString(options.locale, options);
}

export function formatTime(
	date: Date,
	options?: {
		locale?: string;
		timeStyle?: 'medium' | 'full' | 'long' | 'short';
		timeZone?: string;
	}
): string {
	options ??= {};
	options.locale ??= 'th-TH';
	options.timeStyle ??= 'short';
	options.timeZone ??= 'Asia/Bangkok';
	return date.toLocaleTimeString(options.locale, options);
}

export function formatDateTime(
	date: Date,
	options?: {
		locale?: string;
		dateStyle?: 'medium' | 'full' | 'long' | 'short';
		timeStyle?: 'medium' | 'full' | 'long' | 'short';
		timeZone?: string;
	}
): string {
	options ??= {};
	options.locale ??= 'th-TH';
	options.dateStyle ??= 'medium';
	options.timeStyle ??= 'short';
	options.timeZone ??= 'Asia/Bangkok';
	return date.toLocaleString(options.locale, options);
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

export function isTimeZoneValid(timeZone: string): boolean {
	try {
		Intl.DateTimeFormat(undefined, { timeZone });
		return true;
	} catch {
		return false;
	}
}

const us_re = /(\d+).(\d+).(\d+),?\s+(\d+).(\d+)(.(\d+))?/;

const format = {
	timeZone: 'UTC',
	hour12: false,
	year: 'numeric',
	month: 'numeric',
	day: 'numeric',
	hour: 'numeric',
	minute: 'numeric'
} as const;

const utc_f = new Intl.DateTimeFormat('en-US', {
	timeZone: 'UTC',
	hour12: false,
	year: 'numeric',
	month: 'numeric',
	day: 'numeric',
	hour: 'numeric',
	minute: 'numeric'
});

/*
	Modified from: https://github.com/mobz/get-timezone-offset
	License: CC0 1.0 (No Copyright)
*/
export function getTimezoneOffset(timeZone: string): number {
	function diffMinutes(d1: number[], d2: number[]): number {
		const d1h = d1[3] === 24 ? 0 : d1[3];
		const d2h = d2[3] === 24 ? 0 : d2[3];
		let day = d1[1] - d2[1];
		const hour = d1h - d2h;
		const min = d1[4] - d2[4];

		if (day > 15) day = -1;
		if (day < -15) day = 1;

		return 60 * (24 * day + hour) + min;
	}

	function parseDate(date_str: string): number[] {
		date_str = date_str.replace(/[\u200E\u200F]/g, '');
		return [].slice.call(us_re.exec(date_str), 1).map(Math.floor);
	}

	const utcFormat = new Intl.DateTimeFormat('en-US', {
		timeZone: 'UTC',
		hour12: false,
		year: 'numeric',
		month: 'numeric',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric'
	});

	const localFormat = new Intl.DateTimeFormat('en-US', {
		timeZone,
		hour12: false,
		year: 'numeric',
		month: 'numeric',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric'
	});

	const now = new Date();

	return diffMinutes(parseDate(utcFormat.format(now)), parseDate(localFormat.format(now)));
}

export function parseDateAsUtc(dateString: string): Date {
	const date = new Date(dateString);
	if (isNaN(date.getTime())) {
		throw new Error('Invalid date string');
	}
	return new Date(
		Date.UTC(
			date.getFullYear(),
			date.getMonth(),
			date.getDate(),
			date.getHours(),
			date.getMinutes(),
			date.getSeconds(),
			date.getMilliseconds()
		)
	);
}

export function parseDateWithTimeZone(dateString: string, timeZone: string): Date {
	const date = parseDateAsUtc(dateString);
	const offset = getTimezoneOffset(timeZone);
	return new Date(date.getTime() + offset * 60 * 1000);
}
