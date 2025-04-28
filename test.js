import mimeTypes from 'mime-types';

const x = 'image/png, image/jpg'
	.split(/, ?/)
	.map((mimeType) => '.' + (mimeTypes.extension(mimeType) || 'dat'))
	.join(', ');

console.log(x);
console.log(mimeTypes.extensions);
