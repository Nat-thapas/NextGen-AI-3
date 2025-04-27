import mimeTypes from 'mime-types';

export function getExtension(name: string, mimeType: string): string {
	const dotIndex = name.lastIndexOf('.');

	if (dotIndex !== -1) {
		const extension = name.slice(dotIndex);
		const extensionMime = mimeTypes.lookup(extension);
		const mimeExtension = '.' + mimeTypes.extension(mimeType);

		if (extensionMime === mimeType || mimeExtension === extension) {
			return extension;
		}
	}

	return '.' + mimeTypes.extension(mimeType) || '.dat';
}

export function shouldDispositionInline(mimeType: string): boolean {
	return /^(?:text\/|image\/|audio\/|video\/|application\/(?:pdf|json))/i.test(mimeType);
}

export function toFileNameSafe(name: string): string {
	return name.replace(/[^a-z0-9._-]/gi, '-');
}
