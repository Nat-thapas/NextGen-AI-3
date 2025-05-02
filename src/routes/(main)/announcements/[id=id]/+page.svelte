<script lang="ts">
	import { formatDateTime } from '$lib/datetime';

	let { data } = $props();
</script>

<svelte:head>
	<title>CE Next Gen AI - Announcement</title>
</svelte:head>

<div class="mx-auto mt-6 max-w-7xl px-4 md:px-16">
	<h1 class="mb-2 text-3xl font-bold text-primary-foreground md:text-5xl">
		{data.announcement.title}
	</h1>
	<span class="mb-4 block text-lg text-primary-foreground">
		Posted: {formatDateTime(data.announcement.createdAt, {
			timeZone: data.timeZone
		})}
	</span>
	<div class="rounded-xl bg-white px-4 py-2 md:px-12 md:py-8">
		<div
			class="prose prose-lg prose-neutral max-w-none prose-img:mx-auto prose-img:h-fit prose-img:max-w-full">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html data.announcement.html}
		</div>
	</div>
</div>
