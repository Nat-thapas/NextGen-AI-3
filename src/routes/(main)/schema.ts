import { z } from 'zod';

export const formSchema = z.object({
	file: z
		.instanceof(File, { message: 'Please upload a file' })
		.refine(
			(f) =>
				[
					'application/zip',
					'application/zip-compressed',
					'application/x-zip-compressed',
					'multipart/x-zip'
				].includes(f.type),
			'File must be a .zip, .7zip or .rar file'
		)
});
