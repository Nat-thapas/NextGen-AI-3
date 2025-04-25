<script lang="ts">
	import ExamCard from '$lib/components/exam/exam-card.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>CE Next Gen AI - Exercise</title>
</svelte:head>

<div class="mx-auto mt-4 max-w-7xl px-16">
	<h1 class="mb-8 text-center text-5xl font-semibold">Exercise</h1>
	<div class="space-y-4">
		{#each data.availableExams as exam (exam.id)}
			<ExamCard {exam} timeZone={data.timeZone} />
		{/each}
	</div>
</div>
