export function updateAssets(markdown: string, assets: Record<string, string>): string {
	// This regex is for matching images in markdown
	// Only matches the standard image ![Alt](src)
	const matches = markdown.matchAll(/(!\[.*?\]\()(.*?)\)/g);

	let output: string = '';
	let index: number = 0;

	for (const match of matches) {
		let path = match[2];
		if (path.startsWith('/')) {
			path = path.slice(1);
		}

		if (!(path in assets)) continue;

		output += markdown.slice(index, match.index + match[1].length) + assets[path];

		index = match.index + match[1].length + match[2].length;
	}

	output += markdown.slice(index);

	return output;
}
