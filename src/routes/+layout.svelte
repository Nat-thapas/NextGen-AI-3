<script lang="ts">
	import '../app.css';

	import { toast } from 'svelte-sonner';

	import { afterNavigate } from '$app/navigation';

	import { Toaster } from '$lib/components/ui/sonner';

	let { children } = $props();

	function showToast() {
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

			window.history.replaceState(null, '', newUrl);
		}
	}

	afterNavigate(showToast);
</script>

<Toaster theme="light" duration={5000} richColors closeButton />

{@render children()}
