import hljs from 'highlight.js';
import katex from 'katex';
import markdownIt from 'markdown-it';
// @ts-expect-error This module doesn't have type
import markdownItTexmath from 'markdown-it-texmath';

const md = markdownIt({
	html: false,
	linkify: true,
	highlight: function (str, lang) {
		if (lang && hljs.getLanguage(lang)) {
			try {
				return hljs.highlight(str, { language: lang }).value;
			} catch {} // eslint-disable-line no-empty
		}
		return '';
	}
});

md.use(markdownItTexmath, {
	engine: katex,
	delimiters: 'dollars'
});

export function renderMarkdown(markdown: string): string {
	return md.render(markdown);
}
