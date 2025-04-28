<script lang="ts">
	import { ChevronLeft, ChevronRight, CircleX, Clock, Download, File } from '@lucide/svelte';
	import mimeTypes from 'mime-types';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { MediaQuery } from 'svelte/reactivity';
	import { superForm, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { z } from 'zod';

	import { enhance } from '$app/forms';
	import { base } from '$app/paths';
	import { env } from '$env/dynamic/public';

	import { Progress } from '$lib/components/ui/progress';
	import { configConstants } from '$lib/config-constants.js';
	import { formatDurationClock, getSecondsSince, getSecondsUntil } from '$lib/datetime';
	import { questionTypes } from '$lib/enums.js';
	import { getErrorMessage } from '$lib/error.js';
	import { FetchJson } from '$lib/fetch-json';
	import { formatNumber } from '$lib/format-number.js';
	import type { PartialExam } from '$lib/interfaces/exam';
	import type { OwnUserPartial } from '$lib/interfaces/partial-user';
	import type { PartialQuestionAnswer, Question } from '$lib/interfaces/question';
	import type { PartialSubmission } from '$lib/interfaces/submission';

	import type { ActionData } from './$types';

	import fileIcon from '$lib/images/file.avif';

	let {
		data,
		form
	}: {
		data: {
			timeZone: string;
			user: OwnUserPartial | undefined;
			now: number;
			exam: PartialExam;
			questions: PartialQuestionAnswer[];
			submission: PartialSubmission;
			question: Question;
			answer: string | string[] | undefined;
			acceptedFileTypes: string | undefined;
		};
		form: ActionData | undefined;
	} = $props();

	const isLaptop = new MediaQuery('(min-width: 40rem)', false);
	const isDesktop = new MediaQuery('(min-width: 64rem)', false);

	let completedCount = $derived(data.questions.filter((q) => q.answers.length > 0).length);
	let percentCompleted = $derived(100 * (completedCount / data.questions.length));
	let percentCompletedString = $derived(percentCompleted.toFixed(0));

	let showQuestionsCount = $derived(isDesktop.current ? 7 : 5);
	let shownQuestions = $derived.by(() => {
		const minusOne = showQuestionsCount - 1;
		const half = Math.floor(showQuestionsCount / 2);
		let start = Math.max(1, data.question.number - half);
		let end = Math.min(data.questions.length, data.question.number + half);

		if (start === 1 && end - start < minusOne) {
			end = Math.min(data.questions.length, start + minusOne);
		}

		if (end === data.questions.length && end - start < minusOne) {
			start = Math.max(1, end - minusOne);
		}

		return data.questions.slice(start - 1, end);
	});

	let answer = $state(data.answer);

	$effect(() => {
		answer = data.answer;
		console.log($inspect(answer));
	});

	const fetchJson = new FetchJson(fetch, base);

	let syncing = false;
	let now = $state(data.now);
	let offset = $state(data.now - performance.now());
	let PRTUnavaiableWaringDisplayed = false;

	let endAt = $derived(
		Math.min(
			data.submission.createdAt.getTime() + data.exam.timeLimit * 1000,
			data.exam.closeAt.getTime()
		)
	);
	let timeLeft = $derived(endAt - now);

	async function syncNow() {
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
					description: `The time sync latency is at ${latency} ms. This may lead to inaccurate time left display. Please make sure that your internet connection is stable`
				});
			} else if (procDelay > configConstants.exams.timeSyncProcDelayLimit) {
				toast.warning('High time sync processing delay', {
					description: `The time sync processing delay is at ${procDelay} ms. This may lead to inaccurate time left display. This is usually due to insufficient processing power`
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
		const updateNowInterval = setInterval(() => {
			now = performance.now() + offset;
		}, 200);

		const syncNowInterval = setInterval(syncNow, configConstants.exams.timeSyncInterval);

		syncNow();

		return () => {
			clearInterval(updateNowInterval);
			clearInterval(syncNowInterval);
		};
	});
</script>

<svelte:head>
	<title>CE Next Gen AI - {data.exam.title}</title>
</svelte:head>

<div class="mx-auto mt-4 max-w-7xl px-16">
	<form
		method="POST"
		enctype={data.question.questionType === questionTypes.file
			? 'multipart/form-data'
			: 'application/x-www-form-urlencoded'}
		use:enhance={() => {
			return async ({ result, update }) => {
				if (result.type === 'failure') {
					try {
						// @ts-expect-error
						toast.error(result.data.form.errors.answer.join(', '));
					} catch {
						toast.error('Unknown error');
					}
				}
				update();
			};
		}}>
		<div class="mb-4 flex justify-between gap-8">
			<label
				for="exit-button"
				class="flex h-fit w-32 cursor-pointer items-center gap-1 text-lg font-semibold text-secondary-foreground">
				<ChevronLeft />Back
				<input type="submit" id="exit-button" name="next" value="exit" class="hidden" />
			</label>
			<div class="w-0 max-w-xl flex-grow">
				<div class="flex items-center justify-between">
					<span class="mb-2 text-primary-foreground">{percentCompletedString}% Complete</span>
					<span class="mb-2 text-primary-foreground">
						{completedCount} of {data.questions.length}
					</span>
				</div>
				<Progress value={percentCompleted} max={100} class="mb-4 h-3" />
				<div class="flex items-center justify-evenly">
					<label
						for="backward-button"
						class:!text-gray-400={data.question.number === 1}
						class:!bg-gray-300={data.question.number === 1}
						class:!border-gray-300={data.question.number === 1}
						class:!cursor-not-allowed={data.question.number === 1}
						class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2 border-secondary-foreground bg-white p-0 text-secondary-foreground transition-colors">
						<ChevronLeft size={28} />
						<input
							type="submit"
							id="backward-button"
							name="next"
							value={data.question.number - 1}
							disabled={data.question.number === 1}
							class="hidden" />
					</label>
					<div class="flex items-center gap-3">
						{#each shownQuestions as question (question.number)}
							<input
								type="submit"
								name="next"
								value={question.number}
								class:!bg-gray-300={question.answers.length > 0 &&
									question.number !== data.question.number}
								class:!border-gray-300={question.answers.length > 0 &&
									question.number !== data.question.number}
								class:!bg-secondary-foreground={question.number === data.question.number}
								class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2 border-secondary-foreground bg-white p-0" />
						{/each}
					</div>
					<label
						for="forward-button"
						class:!text-gray-400={data.question.number === data.questions.length}
						class:!bg-gray-300={data.question.number === data.questions.length}
						class:!border-gray-300={data.question.number === data.questions.length}
						class:!cursor-not-allowed={data.question.number === data.questions.length}
						class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2 border-secondary-foreground bg-white p-0 text-secondary-foreground transition-colors">
						<ChevronRight size={28} />
						<input
							type="submit"
							id="forward-button"
							name="next"
							value={data.question.number + 1}
							disabled={data.question.number === data.questions.length}
							class="hidden" />
					</label>
				</div>
			</div>
			<div class="w-32"></div>
		</div>
		<div class="mx-2 mb-2 flex items-center gap-4">
			<div
				class="w-0 flex-grow overflow-hidden text-ellipsis text-nowrap text-xl font-semibold text-primary-foreground">
				{data.exam.title}
			</div>
			<div class="flex w-fit items-center justify-start gap-2 text-lg text-primary-foreground">
				<Clock />
				<span>Time left: {formatDurationClock(timeLeft / 1000)}</span>
			</div>
		</div>
		<div class="mx-2 rounded-xl bg-secondary p-4">
			<div
				class="prose prose-lg prose-neutral mb-8 w-full max-w-none overflow-scroll rounded-xl bg-white px-4 py-2 prose-img:h-fit prose-img:w-full prose-img:max-w-lg">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html data.question.html}
			</div>
			{#if data.question.questionType === questionTypes.choices}
				<div class="flex flex-wrap items-stretch gap-4">
					{#each data.question.choices as choice (choice.number)}
						<input
							id={`choice-input-${choice.number}`}
							type="radio"
							name="answer"
							value={choice.number.toString()}
							bind:group={answer}
							class="hidden" />
						<label
							for={`choice-input-${choice.number}`}
							class="prose prose-lg prose-neutral w-80 max-w-96 flex-grow cursor-pointer overflow-scroll rounded-xl bg-white px-4 py-2 prose-img:h-fit prose-img:w-full prose-img:max-w-md">
							<!-- eslint-disable-next-line svelte/no-at-html-tags -->
							{@html choice.html}
						</label>
					{/each}
				</div>
			{:else if data.question.questionType === questionTypes.checkboxes}
				<div class="flex flex-wrap items-stretch gap-4">
					{#each data.question.choices as choice (choice.number)}
						<input
							id={`choice-input-${choice.number}`}
							type="checkbox"
							name="answer"
							value={choice.number.toString()}
							bind:group={answer}
							class="hidden" />
						<label
							for={`choice-input-${choice.number}`}
							class="prose prose-lg prose-neutral w-80 max-w-96 flex-grow cursor-pointer overflow-scroll rounded-xl bg-white px-4 py-2 prose-img:h-fit prose-img:w-full prose-img:max-w-md">
							<!-- eslint-disable-next-line svelte/no-at-html-tags -->
							{@html choice.html}
						</label>
					{/each}
				</div>
			{:else if data.question.questionType === questionTypes.text}
				<div class="relative h-64 w-full">
					<textarea
						name="answer"
						bind:value={answer}
						class="border-1 h-full w-full resize-none overflow-scroll rounded-xl border-gray-300 bg-white px-2 py-1 text-lg">
					</textarea>
					<span
						class:!text-primary-foreground={data.question.textLengthLimit - (answer?.length ?? 0) <
							25 && data.question.textLengthLimit - (answer?.length ?? 0) >= 0}
						class:!text-red-500={data.question.textLengthLimit - (answer?.length ?? 0) < 0}
						class="absolute bottom-0 right-1 rounded-lg bg-white/80 px-1 py-1 text-secondary-foreground">
						{answer?.length ?? 0} / {data.question.textLengthLimit}
					</span>
				</div>
			{:else if data.question.questionType === questionTypes.file}
				<div class="w-full">
					{#if answer && typeof answer === 'string'}
						<div class="relative w-full rounded-xl bg-white p-4">
							<div
								class="block w-full rounded-xl border-2 border-dashed border-secondary-foreground">
								<div
									class="relative mx-auto my-4 w-fit rounded-lg bg-secondary px-4 py-2 text-primary-foreground">
									<File size={128} strokeWidth={1} />
									<a
										href={`${base}/api/files/${answer}`}
										class="mt-2 flex items-center justify-center gap-2 text-lg text-primary-foreground">
										<Download />
										{answer.replace(/.*?\./, 'answer.')}
									</a>
									<div class="absolute right-1 top-1">
										<label for="remove-file-button" class="cursor-pointer">
											<CircleX />
										</label>
										<input
											type="submit"
											id="remove-file-button"
											name="next"
											value="remove-answer"
											class="hidden" />
									</div>
								</div>
							</div>
						</div>
					{:else}
						<div class="relative h-96 w-full rounded-xl bg-white p-4">
							<label
								for="file-input"
								class="block h-full w-full rounded-xl border-2 border-dashed border-secondary-foreground px-4">
								<img
									src={fileIcon}
									alt="File upload icon"
									width="512"
									height="512"
									class="-my-4 mx-auto w-64" />
								<span class="mb-1 block text-center text-lg font-semibold text-primary-foreground">
									Drag & drop a file or <span class="underline">Browse</span>
								</span>
								<span
									class="mb-4 block space-x-2 overflow-hidden text-ellipsis text-nowrap text-center text-lg text-secondary-foreground">
									{#if data.question.fileTypes === null}
										<span>Max: {formatNumber(data.question.fileSizeLimit * 1000)}B</span>
										<span>Accept: any</span>
									{:else}
										<span>Max: {formatNumber(data.question.fileSizeLimit * 1000)}B</span>
										<span>Accept: {data.acceptedFileTypes ?? 'any'}</span>
									{/if}
								</span>
							</label>
							<input
								id="file-input"
								type="file"
								name="answer"
								accept={data.question.fileTypes ?? ''}
								class="absolute bottom-0 left-0 right-0 top-0 cursor-pointer pt-[19.5rem] text-center text-lg text-primary-foreground file:hidden" />
						</div>
					{/if}
				</div>
			{/if}
			{#if form?.form?.errors?.answer}
				<span class="mx-2 mt-2 block text-lg text-red-500">
					{form.form.errors.answer}
				</span>
			{/if}
		</div>
	</form>
</div>

<style lang="postcss">
	input[type='radio']:checked + label {
		@apply outline outline-4 outline-secondary-foreground;
	}

	input[type='checkbox']:checked + label {
		@apply outline outline-4 outline-secondary-foreground;
	}
</style>
