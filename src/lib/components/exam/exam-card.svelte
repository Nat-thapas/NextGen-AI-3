<script lang="ts">
	import { ArrowRight } from '@lucide/svelte';

	import { base } from '$app/paths';

	import { formatDate, formatDateTime, formatTime } from '$lib/datetime';
	import type { Exam } from '$lib/interfaces/exam';

	let { exam, timeZone }: { exam: Exam; timeZone: string } = $props();
</script>

<div class="flex rounded-xl bg-white drop-shadow-lg">
	{#if exam.closeAt < new Date()}
		<div class="h-28 w-3 rounded-l-xl bg-rose-500"></div>
	{:else if exam.closeAt.getTime() - Date.now() < 24 * 60 * 60 * 1000}
		<div class="h-28 w-3 rounded-l-xl bg-amber-500"></div>
	{:else}
		<div class="h-28 w-3 rounded-l-xl bg-green-500"></div>
	{/if}
	<div class="mx-6 flex flex-col items-center justify-center gap-1">
		<span>Due</span>
		<span class="text-lg font-semibold text-primary-foreground">
			{formatDate(exam.closeAt, { locale: 'en-GB', timeZone })}
		</span>
		<span class="text-primary-foreground">
			{formatTime(exam.closeAt, { locale: 'en-GB', timeZone })}
		</span>
	</div>
	<div class="my-2 h-24 w-0.5 bg-primary"></div>
	<div class="flex w-0 flex-grow flex-col justify-center gap-1 px-4 py-2">
		<span
			class="block overflow-hidden text-ellipsis text-nowrap text-lg font-semibold text-primary-foreground">
			{exam.title}
		</span>
		<span class="block overflow-hidden text-ellipsis text-nowrap text-lg">
			{exam.description}
		</span>
		<span class="block overflow-hidden text-ellipsis text-nowrap">
			Begins at: {formatDateTime(exam.openAt, { locale: 'en-GB', timeZone })}
		</span>
	</div>
	<div class="mr-4 flex h-28 w-16 items-center justify-center">
		<a
			href={`${base}/exams/${exam.id}`}
			class="flex h-10 w-10 items-center justify-center rounded-full bg-accent-foreground">
			<ArrowRight size={28} class="text-white" />
		</a>
	</div>
</div>
