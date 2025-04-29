<script lang="ts">
	import { enhance } from '$app/forms';

	import { formatDateTime, formatDuration, getSecondsSince, getSecondsUntil } from '$lib/datetime';

	import exams from '$lib/images/exams.avif';

	let { data } = $props();
</script>

<svelte:head>
	<title>CE Next Gen AI - {data.exam.title}</title>
</svelte:head>

<div class="mx-auto mt-6 max-w-7xl px-16">
	<h1 class="mb-6 text-center text-5xl font-semibold">{data.exam.title}</h1>
	<div class="relative rounded-xl bg-white p-8">
		<div class="mx-auto mb-8 flex h-48 w-64 items-center justify-center">
			<img
				src={exams}
				alt="Exams"
				width="1024"
				height="830"
				class="absolute -top-12 h-fit w-[36rem]" />
		</div>
		<div class="mb-4 flex gap-4">
			<p class="w-28 text-xl text-primary-foreground">Description</p>
			<p class="w-1 text-xl text-primary-foreground">:</p>
			<p class="w-0 flex-grow text-xl text-primary-foreground">{data.exam.description}</p>
		</div>
		<div class="mb-4 flex gap-4">
			<p class="w-28 text-xl text-primary-foreground">Time limit</p>
			<p class="w-1 text-xl text-primary-foreground">:</p>
			<p class="w-0 flex-grow text-xl text-primary-foreground">
				{formatDuration(data.exam.timeLimit)}
			</p>
		</div>
		<div class="mb-4 flex gap-4">
			<p class="w-28 text-xl text-primary-foreground">Due at</p>
			<p class="w-1 text-xl text-primary-foreground">:</p>
			<p class="w-0 flex-grow text-xl text-primary-foreground">
				{formatDateTime(data.exam.closeAt, { locale: 'en-GB', timeZone: data.timeZone })}
			</p>
		</div>
		<div class="mb-4 flex gap-4">
			<p class="w-28 text-xl text-primary-foreground">Status</p>
			<p class="w-1 text-xl text-primary-foreground">:</p>
			<p class="w-0 flex-grow text-xl text-primary-foreground">
				{#if data.exam.submission}
					You have already started this exam. You have {formatDuration(
						Math.min(
							data.exam.timeLimit - getSecondsSince(data.exam.submission.createdAt),
							getSecondsUntil(data.exam.closeAt)
						)
					)} left to complete the exam.
				{:else}
					You have not started this exam. If you start now you'll have {formatDuration(
						Math.min(data.exam.timeLimit, getSecondsUntil(data.exam.closeAt))
					)} to complete the exam.
				{/if}
			</p>
		</div>
		<form method="POST" use:enhance>
			<button
				type="submit"
				class="button-gradient mx-auto block w-96 rounded-full py-2 text-center text-xl font-medium text-white drop-shadow-lg">
				Start
			</button>
		</form>
	</div>
</div>
