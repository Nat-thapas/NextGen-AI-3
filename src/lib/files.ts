import mimeTypes from 'mime-types';

export function getExtension(name: string, mime: string): string {
	const dotIndex = name.lastIndexOf('.');

	if (dotIndex !== -1) {
		const extension = name.slice(dotIndex);
		const extensionMime = mimeTypes.lookup(extension);
		const mimeExtension = mimeTypes.extension(mime);

		if (extensionMime === mime || mimeExtension === extension) {
			return extension;
		}
	}

	return mimeTypes.extension(mime) || 'application/octet-stream';
}
