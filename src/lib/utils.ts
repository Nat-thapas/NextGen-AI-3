import base64url from 'base64url';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { env } from '$env/dynamic/public';

import { configConstants } from './config-constants';

export function generateToken(entropy?: number): string {
	entropy ??= configConstants.entropy.token;
	const bytesCount = Math.ceil(entropy / 8);
	const bytes = new Uint8Array(bytesCount);
	crypto.getRandomValues(bytes);
	return base64url(Buffer.from(bytes));
}

export function generateGuid(): string {
	return generateToken(configConstants.entropy.id);
}

export function cn(...inputs: ClassValue[]): string {
	return twMerge(clsx(inputs));
}

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

export function getErrorMessage(error: App.Error | { message: string }): string {
	return error.message || 'Unknown error';
}

export function setToastParams(
	originalUrl: string | URL,
	message: string,
	description?: string,
	type?: 'success' | 'info' | 'warning' | 'error'
): string {
	let isAbsoluteUrl: boolean;
	let url: URL;
	if (originalUrl instanceof URL) {
		isAbsoluteUrl = false;
		url = originalUrl;
	} else {
		isAbsoluteUrl = originalUrl.startsWith('http://') || originalUrl.startsWith('https://');
		url = new URL(originalUrl, env.PUBLIC_ORIGIN);
	}

	url.searchParams.set('toast-message', encodeURIComponent(message));
	if (description !== undefined) {
		url.searchParams.set('toast-description', encodeURIComponent(description));
	}
	if (type !== undefined) {
		url.searchParams.set('toast-type', type);
	}

	return isAbsoluteUrl ? url.toString() : url.pathname + url.search + url.hash;
}
