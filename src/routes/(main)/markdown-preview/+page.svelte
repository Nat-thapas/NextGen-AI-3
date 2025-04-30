<script lang="ts">
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	import { Switch } from '$lib/components/ui/switch';
	import { getErrorMessage } from '$lib/error';
	import { renderMarkdown } from '$lib/markdown';

	const renderDebounce = 250; // ms.
	const saveDebounce = 1000; // ms.
	const scrollSyncThrottleInterval = 100; // ms.

	let markdown = $state('');
	let html = $state('');

	let mounted = false;

	let syncScrollEnabled = $state(true);
	let renderThrottlingEnabled = $state(false);

	// eslint-disable-next-line no-undef
	let renderTimer: NodeJS.Timeout | number | undefined;
	// eslint-disable-next-line no-undef
	let saveTimer: NodeJS.Timeout | number | undefined;

	let markdownElement: HTMLElement;
	let previewElement: HTMLElement;

	// eslint-disable-next-line no-undef
	let scrollTimer: NodeJS.Timeout | number | undefined;
	let lastScrollSync = 0;

	$effect(() => {
		render(markdown);
		save(markdown);
	});

	$effect(() => {
		saveSettings(syncScrollEnabled, renderThrottlingEnabled);
	});

	function render(markdown: string): void {
		if (!mounted) return;
		if (!renderThrottlingEnabled) {
			html = renderMarkdown(markdown);
			return;
		}
		clearTimeout(renderTimer);
		renderTimer = setTimeout(() => {
			html = renderMarkdown(markdown);
		}, renderDebounce);
	}

	function save(markdown: string): void {
		if (!mounted) return;
		clearTimeout(saveTimer);
		saveTimer = setTimeout(() => {
			try {
				localStorage.setItem('markdown-preview-markdown', markdown);
			} catch (err) {
				toast.error('Failed to save markdown', {
					description: getErrorMessage(err)
				});
			}
		}, saveDebounce);
	}

	function saveSettings(syncScrollEnabled: boolean, renderThrottlingEnabled: boolean): void {
		if (!mounted) return;
		try {
			localStorage.setItem('markdown-preview-sync-scroll', syncScrollEnabled ? 'true' : 'false');
			localStorage.setItem(
				'markdown-preview-render-throttling',
				renderThrottlingEnabled ? 'true' : 'false'
			);
		} catch (err) {
			toast.error('Failed to save settings', {
				description: getErrorMessage(err)
			});
		}
	}

	function dispatchSyncScroll(): void {
		if (!syncScrollEnabled) return;
		clearTimeout(scrollTimer);
		if (Date.now() - lastScrollSync > scrollSyncThrottleInterval) {
			lastScrollSync = Date.now();
			syncScroll();
		} else {
			scrollTimer = setTimeout(
				dispatchSyncScroll,
				Date.now() - lastScrollSync - scrollSyncThrottleInterval
			);
		}
	}

	function syncScroll(): void {
		const percentage =
			markdownElement.scrollTop / (markdownElement.scrollHeight - markdownElement.clientHeight);
		previewElement.scroll({
			top: percentage * (previewElement.scrollHeight - previewElement.clientHeight),
			behavior: 'smooth'
		});
	}

	onMount(() => {
		try {
			const savedMarkdown = localStorage.getItem('markdown-preview-markdown');
			if (savedMarkdown !== null) markdown = savedMarkdown;
			const savedsyncScrollEnabled = localStorage.getItem('markdown-preview-sync-scroll');
			if (savedsyncScrollEnabled !== null) syncScrollEnabled = savedsyncScrollEnabled === 'true';
			const savedRenderThrottlingEnabled = localStorage.getItem(
				'markdown-preview-render-throttling'
			);
			console.log(savedRenderThrottlingEnabled);
			if (savedRenderThrottlingEnabled !== null)
				renderThrottlingEnabled = savedRenderThrottlingEnabled === 'true';
		} catch (err) {
			toast.error('Failed to load save and settings', {
				description: getErrorMessage(err)
			});
		} finally {
			mounted = true;
		}
	});
</script>

<svelte:head>
	<title>CE Next Gen AI - Markdown Preview</title>
</svelte:head>

<div style="height: calc(100dvh - 8rem);" class="mx-16 mt-4 flex rounded-xl bg-white">
	<div class="flex h-full w-1/2 flex-col gap-4 border-r border-gray-300 px-8 py-4">
		<div class="flex items-center gap-8">
			<h2 class="text-3xl font-semibold">Markdown</h2>
			<div class="flex items-center gap-2">
				<Switch bind:checked={syncScrollEnabled} />
				<span class="text-lg">Sync scrolls</span>
			</div>
		</div>
		<textarea
			bind:this={markdownElement}
			bind:value={markdown}
			onscroll={dispatchSyncScroll}
			class="w-full flex-grow resize-none rounded-lg border border-gray-300 px-2 py-1 text-lg">
		</textarea>
	</div>
	<div class="flex h-full w-1/2 flex-col gap-4 border-r border-gray-300 px-8 py-4">
		<div class="flex items-center gap-8">
			<h2 class="text-3xl font-semibold">Preview</h2>
			<div class="flex items-center gap-2">
				<Switch bind:checked={renderThrottlingEnabled} />
				<span class="text-lg">Throttle rendering</span>
			</div>
		</div>
		<div
			bind:this={previewElement}
			class="prose prose-lg prose-neutral w-full max-w-none flex-grow overflow-auto rounded-lg border border-gray-300 px-4 py-2 prose-img:mx-auto prose-img:h-fit prose-img:max-w-full">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html html}
		</div>
	</div>
</div>
