<script lang="ts">
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	import { enhance } from '$app/forms';
	import { base } from '$app/paths';
	import { env } from '$env/dynamic/public';

	import { configConstants } from '$lib/config-constants.js';
	import { formatDateTime, formatDuration, getSecondsSince, getSecondsUntil } from '$lib/datetime';
	import { getErrorMessage } from '$lib/error.js';
	import { FetchJson } from '$lib/fetch-json.js';

	import exams from '$lib/images/exams.avif';

	let { data } = $props();

	const fetchJson = new FetchJson(fetch, base);

	let syncing = false;
	let now = $state(data.now);
	let offset = $state(data.now - performance.now());
	let PRTUnavaiableWaringDisplayed = false;

	async function syncNow(): Promise<void> {
		if (syncing) return;
		syncing = true;
		try {
			const start = performance.now();
			const response = await fetchJson.get<{ now: number }>('/api/now');
			const end = performance.now();

			let latency: number;
			let procDelay: number;

			const perfEntries = performance.getEntriesByName(`${env.PUBLIC_ORIGIN}${base}/api/now`);

			if (perfEntries.length === 0) {
				if (!PRTUnavaiableWaringDisplayed) {
					PRTUnavaiableWaringDisplayed = true;
					toast.warning('Performance Resource Timing API data unavailable', {
						description: 'The time left display may be inaccurate'
					});
				}
				const diff = end - start;
				latency = diff - 5;
				procDelay = 5;
			} else {
				const timing = perfEntries[perfEntries.length - 1];
				if (timing instanceof PerformanceResourceTiming) {
					latency = timing.responseStart - timing.requestStart;
					procDelay = performance.now() - timing.responseStart;
				} else {
					latency = timing.duration;
					procDelay = performance.now() - timing.startTime - timing.duration;
				}
			}

			offset = response.now + procDelay + latency / 2 - performance.now();

			performance.clearResourceTimings();

			if (latency > configConstants.exams.timeSyncLatencyLimit) {
				toast.warning('High time sync latency', {
					description: `The time sync latency is at ${latency.toFixed(0)} ms. This may lead to inaccurate time left display. Please make sure that your internet connection is stable`
				});
			} else if (procDelay > configConstants.exams.timeSyncProcDelayLimit) {
				toast.warning('High time sync processing delay', {
					description: `The time sync processing delay is at ${procDelay.toFixed(0)} ms. This may lead to inaccurate time left display. This is usually due to insufficient processing power`
				});
			}
		} catch (err) {
			toast.error(`Error syncing time from server: ${getErrorMessage(err)}`, {
				description:
					"The time left display may be inaccurate, please make sure that you're online and your internet connection is stable"
			});
		} finally {
			syncing = false;
		}
	}

	onMount(() => {
		const updateNowInterval = setInterval((): void => {
			now = performance.now() + offset;
		}, 200);

		const syncNowInterval = setInterval(syncNow, configConstants.exams.timeSyncInterval);

		syncNow();

		return (): void => {
			clearInterval(updateNowInterval);
			clearInterval(syncNowInterval);
		};
	});
</script>

<svelte:head>
	<title>NextGen AI - {data.exam.title}</title>
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
							data.exam.timeLimit - getSecondsSince(data.exam.submission.createdAt, now),
							getSecondsUntil(data.exam.closeAt, now)
						)
					)} left to complete the exam.
				{:else}
					You have not started this exam. If you start now you'll have {formatDuration(
						Math.min(data.exam.timeLimit, getSecondsUntil(data.exam.closeAt, now))
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
