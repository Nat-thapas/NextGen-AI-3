<script lang="ts">
	import { formatDateTime } from '$lib/datetime';

	let { data } = $props();
</script>

<svelte:head>
	<title>CE Next Gen AI - Announcement</title>
</svelte:head>

<div class="mx-auto mt-4 max-w-7xl px-16">
	<h1 class="text-5xl font-bold text-primary-foreground">
		Announcement: {data.announcement.title}
	</h1>
	<span class="mb-4 block text-lg text-primary-foreground">
		Posted: {formatDateTime(data.announcement.createdAt, data.timeZone)}
	</span>
	<div class="rounded-xl bg-white px-12 py-8">
		<article
			class="prose prose-lg prose-neutral max-w-none prose-img:h-fit prose-img:w-full prose-img:max-w-md">
			{@html data.announcement.html}
		</article>
	</div>
</div>
