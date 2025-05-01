<script lang="ts">
	import {
		ChevronLeft,
		ChevronRight,
		CircleX,
		Clock,
		Download,
		File as FileIcon,
		Menu
	} from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { MediaQuery } from 'svelte/reactivity';

	import { enhance } from '$app/forms';
	import { afterNavigate, beforeNavigate, goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { env } from '$env/dynamic/public';

	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Progress } from '$lib/components/ui/progress';
	import { configConstants } from '$lib/config-constants';
	import { formatDurationClock } from '$lib/datetime';
	import { questionTypes, roles } from '$lib/enums';
	import { getErrorMessage } from '$lib/error';
	import { FetchJson } from '$lib/fetch-json';
	import { formatNumber } from '$lib/format-number';
	import type { PartialExam } from '$lib/interfaces/exam';
	import type { OwnUserPartial } from '$lib/interfaces/partial-user';
	import type { PartialQuestionAnswer, Question } from '$lib/interfaces/question';
	import type { PartialSubmission } from '$lib/interfaces/submission';
	import { isRoleAtLeast } from '$lib/roles';
	import { setToastParams } from '$lib/toast';

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
			answerExists: boolean;
			acceptedFileTypes: string | undefined;
		};
		form: ActionData | undefined;
	} = $props();

	const isLaptop = new MediaQuery('(min-width: 64rem)', false);
	const isDesktop = new MediaQuery('(min-width: 80rem)', false);

	let completedCount = $derived(data.questions.filter((q) => q.answers.length > 0).length);
	let percentCompleted = $derived(100 * (completedCount / data.questions.length));
	let percentCompletedString = $derived(percentCompleted.toFixed(0));

	let showQuestionsCount = $derived(5 + (isLaptop.current ? 2 : 0) + (isDesktop.current ? 2 : 0));
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

	let questionsDialogOpen = $state(false);

	let fileInput: HTMLInputElement | undefined = $state();
	let removeFileVisible = $state(false);

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

	beforeNavigate(({ type, cancel }) => {
		if (
			(type === 'leave' || type === 'link') &&
			!confirm(
				'Are you sure you want to leave this page? You have unsaved changes that will be lost.'
			)
		) {
			cancel();
		}
	});

	afterNavigate(() => {
		questionsDialogOpen = false;
		removeFileVisible = false;
	});

	$effect(() => {
		if (timeLeft < 0 && !isRoleAtLeast(data.user?.role, roles.teacher)) {
			goto(
				setToastParams(
					`${base}/exercises`,
					"You've ran out of time on this exam",
					'Existing answers was automatically submitted',
					'info'
				)
			);
		}
	});
</script>

<svelte:head>
	<title>CE Next Gen AI - {data.exam.title}</title>
</svelte:head>

<div class="mx-auto mt-4 max-w-screen-2xl px-16">
	<form
		id="form"
		method="POST"
		enctype={data.question.questionType === questionTypes.file
			? 'multipart/form-data'
			: 'application/x-www-form-urlencoded'}
		use:enhance={({ formData, cancel }) => {
			for (const [key, value] of formData.entries()) {
				if (key !== 'answer') {
					continue;
				}

				if (
					data.question.questionType === questionTypes.text &&
					(typeof value === 'string' || value instanceof String)
				) {
					if (value.length > data.question.textLengthLimit) {
						toast.error(`Answer must be at most ${data.question.textLengthLimit} characters long`);
						cancel();
						return;
					}
				}

				if (
					data.question.questionType === questionTypes.file &&
					value instanceof File &&
					value.name !== '' &&
					value.size > 0
				) {
					if (
						data.question.fileTypes &&
						!data.question.fileTypes.split(/ *[,;] */).includes(value.type)
					) {
						toast.error(`File must be of a supported types (${data.acceptedFileTypes})`);
						cancel();
						return;
					}
					if (value.size > data.question.fileSizeLimit * 1000) {
						toast.error(
							`File size must be at most ${formatNumber(data.question.fileSizeLimit * 1000)}B`
						);
						cancel();
						return;
					}
				}
			}

			return async ({ result, update }): Promise<void> => {
				if (result.type === 'failure') {
					try {
						// @ts-expect-error It should work, but if it doesn't it's in a try catch
						const errors = result.data.form.errors.answer;
						if (errors instanceof Array) {
							toast.error(errors.join(', '));
						} else if (errors instanceof Object) {
							console.log(errors);
							const errs: string[] = [];
							for (const [index, value] of Object.entries(errors)) {
								console.log(index, value);
								// @ts-expect-error Value is string[]
								errs.push(`${index}: ${value.join(', ')}`);
							}
							console.log(errs);
							toast.error(errs.join(', '));
						}
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
				class="relative flex h-8 w-32 items-center gap-1 text-lg font-semibold text-secondary-foreground transition-colors hover:text-primary-foreground">
				<ChevronLeft />Back
				<input
					type="submit"
					id="exit-button"
					name="next"
					value="exit"
					class="absolute bottom-0 left-0 right-0 top-0 cursor-pointer bg-transparent text-transparent" />
			</label>
			<div class="w-0 max-w-2xl flex-grow">
				<div class="flex items-center justify-between">
					<span class="mb-2 text-primary-foreground">{percentCompletedString}% Complete</span>
					<span class="mb-2 text-primary-foreground">
						{completedCount} of {data.questions.length}
					</span>
				</div>
				<Progress value={percentCompleted} max={100} class="mb-4 h-3" />
				<div class="flex items-center justify-evenly">
					<label
						for="backward-button-top"
						class:!text-gray-400={data.question.number === 1}
						class:!bg-gray-300={data.question.number === 1}
						class:!border-gray-300={data.question.number === 1}
						class="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-secondary-foreground bg-white p-0 text-secondary-foreground transition-colors">
						<ChevronLeft size={28} />
						<input
							type="submit"
							id="backward-button-top"
							name="next"
							value={data.question.number - 1}
							disabled={data.question.number === 1}
							class:!cursor-not-allowed={data.question.number === 1}
							class="absolute bottom-0 left-0 right-0 top-0 cursor-pointer bg-transparent text-transparent" />
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
						for="forward-button-top"
						class:!text-gray-400={data.question.number === data.questions.length}
						class:!bg-gray-300={data.question.number === data.questions.length}
						class:!border-gray-300={data.question.number === data.questions.length}
						class="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-secondary-foreground bg-white p-0 text-secondary-foreground transition-colors">
						<ChevronRight size={28} />
						<input
							type="submit"
							id="forward-button-top"
							name="next"
							value={data.question.number + 1}
							disabled={data.question.number === data.questions.length}
							class:!cursor-not-allowed={data.question.number === data.questions.length}
							class="absolute bottom-0 left-0 right-0 top-0 cursor-pointer bg-transparent text-transparent" />
					</label>
				</div>
			</div>
			<Dialog.Root bind:open={questionsDialogOpen}>
				<Dialog.Trigger
					type="button"
					class="flex h-8 w-32 items-center gap-1 text-lg font-semibold text-secondary-foreground transition-colors hover:text-primary-foreground">
					<Menu />Questions
				</Dialog.Trigger>
				<Dialog.Content class="max-h-[80dvh] overflow-y-auto">
					<Dialog.Header>
						<Dialog.Title>Questions</Dialog.Title>
						<Dialog.Description class="text-lg text-gray-700">
							List of all questions in this exam
						</Dialog.Description>
					</Dialog.Header>
					<div class="flex flex-wrap gap-3">
						{#each data.questions as question (question.number)}
							<input
								form="form"
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
				</Dialog.Content>
			</Dialog.Root>
		</div>
		<div class="mx-2 mb-2 flex items-center gap-4">
			<div
				class="w-0 flex-grow overflow-hidden text-ellipsis text-nowrap text-xl font-semibold text-primary-foreground">
				{data.exam.title}
			</div>
			<div
				class:!text-red-500={timeLeft <= 60_000}
				class="flex w-fit items-center justify-start gap-2 text-lg text-primary-foreground">
				<Clock />
				<span>Time left: {formatDurationClock(timeLeft / 1000)}</span>
			</div>
		</div>
		<div class="mx-2 mb-4 rounded-xl bg-secondary p-4">
			<div
				class="prose prose-lg prose-neutral mb-4 w-full max-w-none overflow-auto rounded-xl bg-white px-4 py-2 prose-img:mx-auto prose-img:h-fit prose-img:max-w-full">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html data.question.html}
			</div>
			<div class="mb-4 border-b-2 border-secondary-foreground"></div>
			{#if data.question.questionType === questionTypes.choices}
				<div class="flex flex-wrap items-stretch gap-4">
					{#each data.question.choices as choice (choice.number)}
						<label
							for={`choice-input-${choice.number}`}
							class:w-3-columns={data.question.choices.length > 4 ||
								data.question.choices.length === 3}
							class="w-2-columns prose prose-lg prose-neutral max-h-64 cursor-pointer overflow-auto rounded-xl bg-white px-4 py-2 prose-img:mx-auto prose-img:h-fit prose-img:max-w-full">
							<!-- eslint-disable-next-line svelte/no-at-html-tags -->
							{@html choice.html}
							<input
								id={`choice-input-${choice.number}`}
								type="radio"
								name="answer"
								value={choice.number.toString()}
								bind:group={answer}
								class="sr-only" />
						</label>
					{/each}
				</div>
			{:else if data.question.questionType === questionTypes.checkboxes}
				<div class="flex flex-wrap items-stretch gap-4">
					{#each data.question.choices as choice (choice.number)}
						<label
							for={`choice-input-${choice.number}`}
							class:w-3-columns={data.question.choices.length > 4 ||
								data.question.choices.length === 3}
							class="w-2-columns prose prose-lg prose-neutral max-h-64 cursor-pointer overflow-auto rounded-xl bg-white px-4 py-2 prose-img:mx-auto prose-img:h-fit prose-img:max-w-full">
							<!-- eslint-disable-next-line svelte/no-at-html-tags -->
							{@html choice.html}
							<input
								id={`choice-input-${choice.number}`}
								type="checkbox"
								name="answer"
								value={choice.number.toString()}
								bind:group={answer}
								class="sr-only" />
						</label>
					{/each}
				</div>
			{:else if data.question.questionType === questionTypes.text}
				<div class="relative h-64 w-full">
					<textarea
						name="answer"
						bind:value={answer}
						class="border-1 h-full w-full resize-none overflow-auto rounded-xl border-gray-300 bg-white px-2 py-1 text-lg">
					</textarea>
					<span
						class:!text-primary-foreground={data.question.textLengthLimit - (answer?.length ?? 0) <
							25 && data.question.textLengthLimit - (answer?.length ?? 0) >= 0}
						class:!text-red-500={data.question.textLengthLimit - (answer?.length ?? 0) < 0}
						class="absolute bottom-0.5 right-1 rounded-lg bg-white/80 px-1 py-1 text-secondary-foreground">
						{answer?.length ?? 0} / {data.question.textLengthLimit}
					</span>
				</div>
			{:else if data.question.questionType === questionTypes.file}
				<div class="w-full">
					{#if data.answerExists && typeof answer === 'string'}
						<div class="relative w-full rounded-xl bg-white p-4">
							<div
								class="block w-full rounded-xl border-2 border-dashed border-secondary-foreground">
								<div
									class="relative mx-auto my-4 w-fit rounded-lg bg-secondary px-4 py-2 text-primary-foreground">
									<FileIcon size={128} strokeWidth={1} />
									<a
										href={`${base}/api/files/${answer}`}
										target="_blank"
										class="mt-2 flex items-center justify-center gap-2 text-lg text-primary-foreground">
										<Download />
										{answer.replace(/^.*?\./, 'answer.')}
									</a>
									<div class="absolute right-1 top-1">
										<label for="remove-file-button" class="relative h-6 w-6">
											<CircleX />
											<input
												type="submit"
												id="remove-file-button"
												name="next"
												value="remove-answer"
												class="absolute bottom-0 left-0 right-0 top-0 h-6 w-6 cursor-pointer bg-transparent text-transparent" />
										</label>
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
								bind:this={fileInput}
								oninput={(): void => {
									removeFileVisible = true;
								}}
								class="absolute bottom-0 left-0 right-0 top-0 cursor-pointer pt-[19.5rem] text-center text-lg text-primary-foreground file:hidden" />
						</div>
					{/if}
				</div>
			{:else}
				<div class="w-full text-center text-lg font-semibold text-red-500">
					Unknown question type
				</div>
			{/if}
			{#if form?.form?.errors?.answer}
				<span class="mx-2 mt-2 block text-lg text-red-500">
					{#if form.form.errors.answer instanceof Array}
						{form.form.errors.answer.join(', ')}
					{:else if form.form.errors.answer instanceof Object}
						{Object.entries(form.form.errors.answer).reduce(
							(acc, [index, value]) => (acc += `${index}: ${value.join(', ')}`),
							''
						)}
					{:else}
						Unknown error
					{/if}
				</span>
			{/if}
		</div>
		<div class="mx-2 flex items-center justify-between">
			<label
				for="backward-button-bottom"
				class="relative flex items-center justify-center rounded-full border-2 border-accent-foreground bg-white px-4 py-1 text-lg font-semibold text-accent-foreground drop-shadow-lg">
				Back
				<input
					type="submit"
					id="backward-button-bottom"
					name="next"
					value={data.question.number - 1 || 'exit'}
					class="absolute bottom-0 left-0 right-0 top-0 cursor-pointer bg-transparent text-transparent" />
			</label>
			{#if data.answerExists && data.question.questionType !== questionTypes.file}
				<label
					for="remove-answer-button"
					class="relative flex items-center justify-center rounded-full border-2 border-accent-foreground bg-white px-4 py-1 text-lg font-semibold text-accent-foreground drop-shadow-lg">
					Remove Answer
					<input
						type="submit"
						id="remove-answer-button"
						name="next"
						value="remove-answer"
						class="absolute bottom-0 left-0 right-0 top-0 cursor-pointer bg-transparent text-transparent" />
				</label>
			{:else if data.question.questionType === questionTypes.file && removeFileVisible}
				<button
					type="button"
					onclick={(): void => {
						if (fileInput) {
							fileInput.value = '';
						}
						removeFileVisible = false;
					}}
					class="relative flex items-center justify-center rounded-full border-2 border-accent-foreground bg-white px-4 py-1 text-lg font-semibold text-accent-foreground drop-shadow-lg">
					Remove File
				</button>
			{/if}
			{#if data.question.number === data.questions.length}
				<AlertDialog.Root>
					<AlertDialog.Trigger
						type="button"
						class="button-gradient flex cursor-pointer items-center justify-center rounded-full px-5 py-1.5 text-lg font-semibold text-white drop-shadow-lg">
						Submit
					</AlertDialog.Trigger>
					<AlertDialog.Content>
						<AlertDialog.Header>
							<AlertDialog.Title>Confirm Exam Submission</AlertDialog.Title>
							<AlertDialog.Description class="text-lg text-gray-700">
								Are you sure you want to submit your exam? Once submitted, you will not be able to
								make any changes.
							</AlertDialog.Description>
						</AlertDialog.Header>
						<AlertDialog.Footer>
							<AlertDialog.Cancel
								class="flex cursor-pointer items-center justify-center rounded-full border-2 border-accent-foreground bg-white px-4 py-1 text-lg font-semibold text-accent-foreground drop-shadow-lg hover:bg-secondary">
								Cancel
							</AlertDialog.Cancel>
							<AlertDialog.Action
								class="button-gradient relative flex items-center justify-center rounded-full px-5 py-1.5 text-lg font-semibold text-white drop-shadow-lg">
								<label for="submit-button-bottom">
									Submit
									<input
										form="form"
										type="submit"
										id="submit-button-bottom"
										name="next"
										value="submit"
										class="absolute bottom-0 left-0 right-0 top-0 cursor-pointer bg-transparent text-transparent" />
								</label>
							</AlertDialog.Action>
						</AlertDialog.Footer>
					</AlertDialog.Content>
				</AlertDialog.Root>
			{:else}
				<label
					for="forward-button-bottom"
					class="relative flex items-center justify-center rounded-full border-2 border-accent-foreground bg-white px-4 py-1 text-lg font-semibold text-accent-foreground drop-shadow-lg">
					Next
					<input
						type="submit"
						id="forward-button-bottom"
						name="next"
						value={data.question.number + 1}
						disabled={data.question.number === data.questions.length}
						class="absolute bottom-0 left-0 right-0 top-0 cursor-pointer bg-transparent text-transparent" />
				</label>
			{/if}
		</div>
	</form>
</div>

<style lang="postcss">
	label:has(input[type='radio']:checked) {
		@apply outline outline-4 outline-secondary-foreground;
	}

	label:has(input[type='checkbox']:checked) {
		@apply outline outline-4 outline-secondary-foreground;
	}

	input[type='file'].text-center {
		text-align-last: center;
	}

	.w-2-columns {
		width: calc(50% - 0.5rem);
	}

	@media (min-width: 80rem) {
		.w-3-columns {
			width: calc(33% - 0.5rem) !important;
		}
	}
</style>
