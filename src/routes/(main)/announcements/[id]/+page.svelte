<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>CE Next Gen AI - Announcement</title>
</svelte:head>

<article class="prose prose-neutral">
	{@html data.announcementHtml}
</article>
