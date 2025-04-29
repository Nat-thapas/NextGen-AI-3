<script lang="ts">
	import { ArrowRight, Download, SquareSigma } from '@lucide/svelte';

	import { base } from '$app/paths';

	import { formatDate, formatDateTime, formatTime } from '$lib/datetime';
	import type { Exam } from '$lib/interfaces/exam';
	import type { OwnUserPartial } from '$lib/interfaces/partial-user';
	import { isRoleAtLeast } from '$lib/roles';

	let {
		user,
		exam,
		onDownloadClick,
		color,
		isExamAvailable,
		timeZone
	}: {
		user: OwnUserPartial | undefined;
		exam: Exam;
		onDownloadClick: () => any;
		color: 'green' | 'blue' | 'amber' | 'gray' | 'red';
		isExamAvailable: boolean;
		timeZone: string;
	} = $props();
</script>

<div class="flex rounded-xl bg-white drop-shadow-lg">
	<div
		class:bg-green-500={color === 'green'}
		class:bg-blue-500={color === 'blue'}
		class:bg-amber-500={color === 'amber'}
		class:bg-gray-500={color === 'gray'}
		class:bg-rose-500={color === 'red'}
		class="h-28 w-3 rounded-l-xl">
	</div>
	<div class="flex w-36 flex-col items-center justify-center gap-1">
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
	<div class="mr-4 flex h-28 w-16 flex-col items-center justify-center gap-2">
		{#if isRoleAtLeast(user?.role, 'teacher')}
			<button
				onclick={onDownloadClick}
				class="flex h-10 w-10 items-center justify-center rounded-full bg-accent-foreground">
				<Download class="text-white" />
			</button>
		{/if}
		{#if isExamAvailable}
			<a
				href={`${base}/exercises/${exam.id}`}
				class="flex h-10 w-10 items-center justify-center rounded-full bg-accent-foreground">
				<ArrowRight size={28} class="text-white" />
			</a>
		{:else}
			<button disabled class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300">
				<ArrowRight size={28} class="text-white" />
			</button>
		{/if}
	</div>
</div>
