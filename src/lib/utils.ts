import base64url from 'base64url';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function generateToken(entropy: number): string {
	const bytesCount = Math.ceil(entropy / 8);
	const bytes = new Uint8Array(bytesCount);
	crypto.getRandomValues(bytes);
	return base64url(String.fromCharCode(...bytes));
}

export function generateTuid(): string {
	return generateToken(96);
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
