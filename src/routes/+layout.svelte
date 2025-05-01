<script lang="ts">
	import '../app.css';
	import '../font.css';
	import '../katex.css';
	import '../hljs.css';

	import { tick } from 'svelte';
	import { toast } from 'svelte-sonner';

	import { afterNavigate, beforeNavigate, replaceState } from '$app/navigation';
	import { page, updated } from '$app/state';

	import { Toaster } from '$lib/components/ui/sonner';

	let { children } = $props();

	beforeNavigate(({ willUnload, to }) => {
		if (updated.current && !willUnload && to?.url) {
			location.href = to.url.href;
		}
	});

	afterNavigate(async () => {
		const urlParams = new URLSearchParams(window.location.search);
		if (urlParams.has('toast-message') || urlParams.has('toast-description')) {
			let message = urlParams.get('toast-message');
			let description: string | undefined = urlParams.get('toast-description') ?? '';
			const type = urlParams.get('toast-type') || 'default';

			if (message) message = decodeURIComponent(message);
			if (description) description = decodeURIComponent(description);

			if (!message) {
				message = description;
				description = undefined;
			}

			if (message) {
				switch (type) {
					case 'success':
						toast.success(message, { description });
						break;
					case 'info':
						toast.info(message, { description });
						break;
					case 'warning':
						toast.warning(message, { description });
						break;
					case 'error':
						toast.error(message, { description });
						break;
					default:
						toast(message, { description });
						break;
				}
			}

			const newUrl = new URL(window.location.href);
			newUrl.searchParams.delete('toast-message');
			newUrl.searchParams.delete('toast-description');
			newUrl.searchParams.delete('toast-type');

			await tick();
			replaceState(newUrl, page.state);
		}
	});
</script>

<Toaster theme="light" duration={5000} richColors closeButton />

{@render children()}
