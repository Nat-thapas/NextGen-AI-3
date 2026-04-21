<script lang="ts">
	import { python } from '@codemirror/lang-python';
	import { oneDark } from '@codemirror/theme-one-dark';
	import {
		ChevronLeft,
		ChevronRight,
		CircleX,
		Clock,
		Download,
		File as FileIcon,
		Menu,
		Play,
		RotateCcw
	} from '@lucide/svelte';
	import { onMount } from 'svelte';
	import CodeMirror from 'svelte-codemirror-editor';
	import { toast } from 'svelte-sonner';
	import { MediaQuery } from 'svelte/reactivity';

	import { enhance } from '$app/forms';
	import { afterNavigate, beforeNavigate, goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { env } from '$env/dynamic/public';

	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import * as Dialog from '$lib/components/ui/dialog';
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
			visibleTestcases: { number: number; stdin: string; expectedOut: string; isHidden: boolean }[];
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

	let currentQuestionNumber = $state(data.question.number);
	let answer = $state(data.answer ?? '');
	let initialAnswer = $state(data.answer ?? '');
	let activeTestcase = $state(0);
	let activeTab = $state<'testcase' | 'testresult'>('testcase');

	let running = $state(false);

	$effect.pre(() => {
		if (currentQuestionNumber !== data.question.number) {
			currentQuestionNumber = data.question.number;
			answer = data.answer ?? '';
			initialAnswer = data.answer ?? '';
			activeTestcase = 0;
			activeTab = 'testcase';
		} else if (data.question.questionType === questionTypes.file) {
			answer = data.answer ?? '';
		}
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
		if (form?.runResults && (form.runResults as unknown[]).length > 0) {
			activeTab = 'testresult';
		}
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
	<title>NextGen AI - {data.exam.title}</title>
</svelte:head>

<!-- Top Navigation Bar -->
<header class="exam-topbar">
	<div class="exam-topbar-inner">
	<a href={`${base}/`}>
		<div class="exam-logo">
			<span class="exam-logo-text">
				CE
				<span class="logo-accent">Next</span>
			</span>
		</div>
	</a>

		<nav class="question-nav">
			<label for="nav-back-btn" class="nav-arrow-btn" class:disabled={data.question.number === 1}>
				<ChevronLeft size={20} />
				<input
					form="form"
					type="submit"
					id="nav-back-btn"
					name="next"
					value={data.question.number - 1}
					disabled={data.question.number === 1}
					class="hidden-submit" />
			</label>

			<div class="question-bubbles">
				{#each shownQuestions as question (question.number)}
					<label
						class="q-bubble"
						class:answered={question.answers.length > 0 && question.number !== data.question.number}
						class:current={question.number === data.question.number}>
						{question.number}
						<input
							form="form"
							type="submit"
							name="next"
							value={question.number}
							class="hidden-submit" />
					</label>
				{/each}
			</div>

			<label
				for="nav-fwd-btn"
				class="nav-arrow-btn"
				class:disabled={data.question.number === data.questions.length}>
				<ChevronRight size={20} />
				<input
					form="form"
					type="submit"
					id="nav-fwd-btn"
					name="next"
					value={data.question.number + 1}
					disabled={data.question.number === data.questions.length}
					class="hidden-submit" />
			</label>
		</nav>

		<div class="exam-topbar-right">
			<div class="time-display" class:urgent={timeLeft <= 60_000}>
				<Clock size={16} />
				<span>เวลาที่เหลือ {formatDurationClock(timeLeft / 1000)}</span>
			</div>

			<Dialog.Root bind:open={questionsDialogOpen}>
				<Dialog.Trigger type="button" class="all-questions-btn">
					<Menu size={16} />
					<span>คำถามทั้งหมด</span>
				</Dialog.Trigger>
				<Dialog.Content class="max-h-[80dvh] overflow-y-auto">
					<Dialog.Header>
						<Dialog.Title>Questions</Dialog.Title>
						<Dialog.Description class="text-lg text-gray-700">
							List of all questions in this exam
						</Dialog.Description>
					</Dialog.Header>
					<div class="flex flex-wrap gap-3 p-4">
						{#each data.questions as question (question.number)}
							<label
								class="q-bubble"
								class:answered={question.answers.length > 0 &&
									question.number !== data.question.number}
								class:current={question.number === data.question.number}>
								{question.number}
								<input
									form="form"
									type="submit"
									name="next"
									value={question.number}
									class="hidden-submit" />
							</label>
						{/each}
					</div>
				</Dialog.Content>
			</Dialog.Root>
		</div>
	</div>

	<div class="progress-row">
		<div class="progress-labels">
			<span>ทำไปแล้ว</span>
			<span>{percentCompletedString}%</span>
		</div>
		<div class="progress-track">
			<div class="progress-fill" style="width: {percentCompleted}%"></div>
		</div>
	</div>
</header>

<!-- Main form -->
<form
	id="form"
	method="POST"
	action="?/saveAnswer"
	enctype={data.question.questionType === questionTypes.file
		? 'multipart/form-data'
		: 'application/x-www-form-urlencoded'}
	use:enhance={({ formData, cancel, action }) => {
		if (action.search === '?/runCode') {
			running = true;
		}

		const entries = Array.from(formData.entries()) as Array<[string, FormDataEntryValue]>;
		for (const [key, value] of entries) {
			if (key !== 'answer') continue;

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
			running = false;

			if (result.type === 'failure') {
				if (result.data?.globalError) {
					toast.error('An error occurred while running your code. Please try again.');
				} else if (result.data?.error) {
					toast.error(result.data.error as string);
				} else {
					try {
						const errors = result.data?.form?.errors?.answer;
						if (errors instanceof Array) {
							toast.error(errors.join(', '));
						} else if (errors instanceof Object) {
							const errs: string[] = [];
							for (const [index, value] of Object.entries(errors)) {
								errs.push(`${index}: ${(value as string[]).join(', ')}`);
							}
							toast.error(errs.join(', '));
						}
					} catch {
						toast.error('Unknown error');
					}
				}
			}
			update({ reset: false });
		};
	}}>
	<div class="exam-body">
		{#if data.question.questionType === questionTypes.code}
			<!-- CODE QUESTION: two-panel layout -->
			<div class="code-layout">
				<!-- Left panel: question -->
				<aside class="question-panel">
					<div class="panel-box">
						<div
							class="prose prose-sm prose-neutral w-full max-w-none overflow-auto px-4 py-3 prose-img:mx-auto prose-img:h-fit prose-img:max-w-full">
							<!-- eslint-disable-next-line svelte/no-at-html-tags -->
							{@html data.question.html}
						</div>
					</div>
				</aside>

				<!-- Right panel: editor + testcases -->
				<div class="editor-panel">
					<!-- Code editor box -->
					<div class="editor-box">
						<div class="editor-topbar">
							<div class="editor-lang">
								<span>Python</span>
								<ChevronRight size={16} style="transform: rotate(90deg); opacity: 0.5;" />
							</div>
							<div class="editor-actions">
								<button
									type="button"
									class="editor-reset-btn"
									onclick={() => {
										answer = initialAnswer;
									}}>
									<RotateCcw size={14} />
									<span>Reset</span>
								</button>
								<button
									type="submit"
									formaction="?/runCode"
									class="editor-run-btn"
									disabled={running}
									class:running>
									{#if running}
										<span>Loading...</span>
									{:else}
										<Play size={14} />
										<span>RUN</span>
									{/if}
								</button>
							</div>
						</div>
						<!-- CodeMirror component -->
						<CodeMirror
							bind:value={answer as string}
							lang={python()}
							theme={oneDark}
							tabSize={4}
							useTab={true}
							styles={{
								'&': { minHeight: '300px', maxHeight: '900px' },
								'.cm-scroller': { fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }
							}} />
						<input type="hidden" name="answer" value={answer} />
					</div>

					<!-- Testcase / Test Result toggle box -->
					<div class="testcase-box">
						<div class="testcase-topbar">
							<div class="testcase-tabs">
								<button
									type="button"
									class="tc-tab-btn"
									class:tc-tab-active={activeTab === 'testcase'}
									onclick={() => (activeTab = 'testcase')}>
									Testcase
								</button>
								<span class="tc-divider-line"></span>
								<button
									type="button"
									class="tc-tab-btn"
									class:tc-tab-active={activeTab === 'testresult'}
									onclick={() => (activeTab = 'testresult')}>
									Test Result
								</button>
							</div>
						</div>

						<!-- ── TESTCASE TAB ── -->
						{#if activeTab === 'testcase'}
							{#if data.visibleTestcases.length > 0}
								<div class="case-tabs">
									{#each data.visibleTestcases as _tc, i}
										<button
											type="button"
											class="case-tab"
											class:active={activeTestcase === i}
											onclick={() => (activeTestcase = i)}>
											Case {i + 1}
										</button>
									{/each}
								</div>

								{#each data.visibleTestcases as tc, i}
									{#if activeTestcase === i}
										<div class="case-detail">
											<div class="io-block">
												<div class="io-label">Input</div>
												<pre class="io-pre">{tc.stdin || '(empty)'}</pre>
											</div>
										</div>
									{/if}
								{/each}
							{:else}
								<p class="tc-empty">No visible test cases for this question.</p>
							{/if}

							<!-- ── TEST RESULT TAB ── -->
						{:else if form?.runResults && (form.runResults as unknown[]).length > 0}
							{@const results = form.runResults as Array<{
								testcaseNumber: number;
								passed: boolean;
								actualOut: string;
								status: string;
							}>}
							{@const passed = results.filter((r) => r.passed).length}
							{@const total = results.length}

							<div class="tc-summary-row">
								<span class="tc-summary-label">ผ่าน {passed}/{total} Testcase</span>
								<span class="tc-summary-detail">
									Visible Cases: {passed}/{data.visibleTestcases.length}
								</span>
							</div>

							<div class="case-tabs">
								{#each data.visibleTestcases as tc, i}
									{@const result = results.find((r) => r.testcaseNumber === tc.number)}
									<button
										type="button"
										class="case-tab"
										class:active={activeTestcase === i}
										class:passed={result?.passed === true}
										class:failed={result !== undefined && !result.passed}
										onclick={() => (activeTestcase = i)}>
										{#if result?.passed}
											<span class="case-dot green"></span>
										{:else if result !== undefined && !result.passed}
											<span class="case-dot red"></span>
										{/if}
										Case {i + 1}
									</button>
								{/each}
							</div>

							{#each data.visibleTestcases as tc, i}
								{@const result = results.find((r) => r.testcaseNumber === tc.number)}
								{#if activeTestcase === i}
									<div class="case-detail">
										<div class="case-io-row">
											<div class="io-block">
												<div class="io-label">Input (stdin)</div>
												<pre class="io-pre">{tc.stdin || '(empty)'}</pre>
											</div>
											<div class="io-block">
												<div class="io-label">Expected Output</div>
												<pre class="io-pre expected">{tc.expectedOut || '(empty)'}</pre>
											</div>
										</div>
										<div class="io-block full">
											<div class="io-label">Actual Output</div>
											{#if result}
												<pre
													class="io-pre"
													class:failed-out={!result.passed}
													class:passed-out={result.passed}>{result.actualOut || '(No Output)'}</pre>
												{#if result.passed}
													<span class="status-badge passed">Passed</span>
												{:else}
													<span class="status-badge failed">Failed ({result.status})</span>
												{/if}
											{/if}
										</div>
									</div>
								{/if}
							{/each}
						{:else}
							<!-- Never run state -->
							<div class="tc-never-run">
								<div class="tc-never-run-icon">
									<Play size={32} strokeWidth={1.5} />
								</div>
								<p class="tc-never-run-text">ยังไม่มีข้อมูลการทดสอบ</p>
								<p class="tc-never-run-sub">กรุณากดปุ่ม RUN เพื่อเริ่มตรวจสอบโค้ดของคุณ</p>
							</div>
						{/if}
					</div>
				</div>
			</div>
		{:else}
			<!-- NON-CODE QUESTION: centered single-column -->
			<div class="single-col-layout">
				<div class="panel-box question-card">
					<div
						class="prose prose-lg prose-neutral mb-4 w-full max-w-none overflow-auto px-4 py-3 prose-img:mx-auto prose-img:h-fit prose-img:max-w-full">
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						{@html data.question.html}
					</div>

					<div class="divider"></div>

					{#if data.question.questionType === questionTypes.choices}
						<div class="choices-grid">
							{#each data.question.choices as choice (choice.number)}
								<label
									for={`choice-input-${choice.number}`}
									class="choice-card prose prose-lg prose-neutral overflow-auto prose-img:mx-auto prose-img:h-fit prose-img:max-w-full">
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
						<div class="choices-grid">
							{#each data.question.choices as choice (choice.number)}
								<label
									for={`choice-input-${choice.number}`}
									class="choice-card prose prose-lg prose-neutral overflow-auto prose-img:mx-auto prose-img:h-fit prose-img:max-w-full">
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
						<div class="relative h-64 w-full px-4 pb-4">
							<textarea name="answer" bind:value={answer} class="text-answer-area"></textarea>
							<span
								class="char-counter"
								class:warn={data.question.textLengthLimit - (answer?.length ?? 0) < 25 &&
									data.question.textLengthLimit - (answer?.length ?? 0) >= 0}
								class:over={data.question.textLengthLimit - (answer?.length ?? 0) < 0}>
								{answer?.length ?? 0} / {data.question.textLengthLimit}
							</span>
						</div>
					{:else if data.question.questionType === questionTypes.file}
						<div class="w-full">
							{#if data.answerExists && typeof answer === 'string'}
								<div class="file-existing">
									<div class="file-drop-zone">
										<div class="file-card">
											<FileIcon size={80} strokeWidth={1} />
											<a href={`${base}/api/files/${answer}`} target="_blank" class="file-link">
												<Download size={16} />
												{answer.replace(/^.*?\./, 'answer.')}
											</a>
											<label for="remove-file-button" class="file-remove-btn">
												<CircleX size={18} />
												<input
													type="submit"
													id="remove-file-button"
													name="next"
													value="remove-answer"
													class="hidden-submit" />
											</label>
										</div>
									</div>
								</div>
							{:else}
								<div class="file-upload-area">
									<label for="file-input" class="file-drop-zone">
										<img
											src={fileIcon}
											alt="File upload icon"
											width="512"
											height="512"
											class="file-upload-icon" />
										<span class="file-upload-title">
											Drag & drop a file or <span class="underline">Browse</span>
										</span>
										<span class="file-upload-meta">
											{#if data.question.fileTypes === null}
												Max: {formatNumber(data.question.fileSizeLimit * 1000)}B · Accept: any
											{:else}
												Max: {formatNumber(data.question.fileSizeLimit * 1000)}B · Accept: {data.acceptedFileTypes ??
													'any'}
											{/if}
										</span>
									</label>
									<input
										type="submit"
										id="auto-save-file-button"
										name="next"
										value={String(data.question.number)}
										style="display:none" />
									<input
										id="file-input"
										type="file"
										name="answer"
										accept={data.question.fileTypes ?? ''}
										bind:this={fileInput}
										oninput={() => {
											removeFileVisible = true;
											document.getElementById('auto-save-file-button')?.click();
										}}
										class="file-input-hidden" />
								</div>
							{/if}
						</div>
					{:else}
						<div class="w-full text-center text-lg font-semibold text-red-500">
							Unknown question type
						</div>
					{/if}

					{#if form?.form?.errors?.answer}
						<span class="error-msg">
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
			</div>
		{/if}
	</div>

	<!-- Bottom nav bar -->
	<footer class="exam-footer">
		<label for="bottom-back-btn" class="footer-btn outline-btn">
			<ChevronLeft size={18} />
			ข้อก่อนหน้า
			<input
				type="submit"
				id="bottom-back-btn"
				name="next"
				value={data.question.number - 1 || 'exit'}
				class="hidden-submit" />
		</label>

		<!--<div class="footer-progress">
			<div class="footer-progress-labels">
				<span>ทำไปแล้ว</span>
				<span>{percentCompletedString}%</span>
			</div>
			<div class="footer-progress-track">
				<div class="footer-progress-fill" style="width: {percentCompleted}%"></div>
			</div>
		</div>-->

		<div class="footer-right">
			<!--{#if data.answerExists && data.question.questionType !== questionTypes.file}
				<label for="remove-answer-btn" class="footer-btn outline-btn">
					Remove Answer
					<input
						type="submit"
						id="remove-answer-btn"
						name="next"
						value="remove-answer"
						class="hidden-submit" />
				</label>
			{:else if data.question.questionType === questionTypes.file && removeFileVisible}
				<button
					type="button"
					onclick={() => {
						if (fileInput) fileInput.value = '';
						removeFileVisible = false;
					}}
					class="footer-btn outline-btn">
					Remove File
				</button>
			{/if}-->

			{#if data.question.number === data.questions.length}
				<AlertDialog.Root>
					<AlertDialog.Trigger type="button" class="footer-btn primary-btn">
						ส่งข้อสอบ
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
							<AlertDialog.Cancel class="footer-btn outline-btn">Cancel</AlertDialog.Cancel>
							<AlertDialog.Action class="footer-btn primary-btn relative">
								<label for="submit-bottom">
									Submit
									<input
										form="form"
										type="submit"
										id="submit-bottom"
										name="next"
										value="submit"
										class="hidden-submit" />
								</label>
							</AlertDialog.Action>
						</AlertDialog.Footer>
					</AlertDialog.Content>
				</AlertDialog.Root>
			{:else}
				<label for="bottom-next-btn" class="footer-btn primary-btn">
					ข้อถัดไป
					<ChevronRight size={18} />
					<input
						type="submit"
						id="bottom-next-btn"
						name="next"
						value={data.question.number + 1}
						disabled={data.question.number === data.questions.length}
						class="hidden-submit" />
				</label>
			{/if}
		</div>
	</footer>
</form>

<style lang="postcss">
	/* ─── Variables ─────────────────────────────────────── */
	:root {
		--blue: #006fe8;
		--blue-light: #d3e8ff;
		--blue-bg: #f3f8ff;
		--gray-border: #d0d5dd;
		--gray-text: #344054;
		--dark: #101828;
		--muted: #667085;
		--bg: #f5f9fd;
		--white: #ffffff;
		--radius: 8px;
	}

	/* ─── Top Bar ───────────────────────────────────────── */
	.exam-topbar {
		background: var(--white);
		border-bottom: 1px solid #eaecf0;
		position: sticky;
		top: 0;
		z-index: 50;
	}

	.exam-topbar-inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 32px;
		height: 72px;
		max-width: 1440px;
		margin: 0 auto;
		gap: 16px;
	}

	.exam-logo {
		min-width: 120px;
	}

	.exam-logo-text {
		font-family: 'Noto Sans Thai', sans-serif;
		font-weight: 700;
		font-size: 20px;
		color: var(--dark);
		letter-spacing: -0.5px;
	}

	.logo-accent {
		color: var(--blue);
	}

	.question-nav {
		display: flex;
		align-items: center;
		gap: 8px;
		flex: 1;
		justify-content: center;
	}

	.nav-arrow-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: 50%;
		border: 1.5px solid var(--gray-border);
		background: var(--white);
		cursor: pointer;
		color: var(--dark);
		position: relative;
		transition:
			border-color 0.15s,
			background 0.15s;
	}

	.nav-arrow-btn:not(.disabled):hover {
		border-color: var(--blue);
		background: var(--blue-bg);
	}

	.nav-arrow-btn.disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.question-bubbles {
		display: flex;
		gap: 8px;
		align-items: center;
	}

	.q-bubble {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		border-radius: 50%;
		border: 1.5px solid var(--blue);
		background: var(--white);
		cursor: pointer;
		font-family: 'Noto Sans Thai', sans-serif;
		font-size: 18px;
		color: var(--dark);
		position: relative;
		transition:
			background 0.15s,
			color 0.15s;
		user-select: none;
	}

	.q-bubble.answered {
		background: var(--blue-light);
		border-color: var(--blue);
		color: var(--dark);
	}

	.q-bubble.current {
		background: var(--blue);
		border-color: var(--blue);
		color: var(--white);
		font-weight: 700;
	}

	.q-bubble:not(.current):hover {
		background: var(--blue-bg);
	}

	.exam-topbar-right {
		display: flex;
		align-items: center;
		gap: 16px;
		min-width: 200px;
		justify-content: flex-end;
	}

	.time-display {
		display: flex;
		align-items: center;
		gap: 6px;
		font-family: 'Noto Sans Thai', sans-serif;
		font-size: 15px;
		color: var(--dark);
		white-space: nowrap;
	}

	.time-display.urgent {
		color: #e53e3e;
		font-weight: 700;
	}

	:global(.all-questions-btn) {
		display: flex;
		align-items: center;
		gap: 6px;
		font-family: 'Noto Sans Thai', sans-serif;
		font-size: 15px;
		font-weight: 500;
		color: var(--dark);
		background: none;
		border: none;
		cursor: pointer;
		padding: 6px 10px;
		border-radius: 6px;
		transition: background 0.15s;
	}

	:global(.all-questions-btn:hover) {
		background: var(--blue-bg);
		color: var(--blue);
	}

	.progress-row {
		padding: 0 32px 10px;
		max-width: 1440px;
		margin: 0 auto;
	}

	.progress-labels {
		display: flex;
		justify-content: space-between;
		font-family: 'Noto Sans Thai', sans-serif;
		font-size: 14px;
		font-weight: 500;
		color: var(--dark);
		margin-bottom: 4px;
	}

	.progress-track {
		width: 100%;
		height: 14px;
		background: var(--gray-border);
		border-radius: 100px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: var(--blue);
		border-radius: 100px;
		transition: width 0.4s ease;
	}

	/* ─── Body ──────────────────────────────────────────── */
	.exam-body {
		flex: 1;
		background: var(--bg);
		padding: 20px 32px;
		min-height: calc(100vh - 144px);
	}

	.code-layout {
		display: grid;
		grid-template-columns: 380px 1fr;
		gap: 16px;
		max-width: 1340px;
		margin: 0 auto;
	}

	.question-panel {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.panel-box {
		background: var(--white);
		border: 1px solid var(--gray-border);
		border-radius: var(--radius);
		overflow: hidden;
	}

	.editor-panel {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	/* ─── Editor ────────────────────────────────────────── */
	.editor-box {
		background: var(--white);
		border: 1px solid var(--gray-border);
		border-radius: var(--radius);
		overflow: hidden;
	}

	.editor-topbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 16px;
		height: 36px;
		border-bottom: 1px solid var(--gray-border);
		background: var(--white);
	}

	.editor-lang {
		display: flex;
		align-items: center;
		gap: 4px;
		font-family: 'Noto Sans Thai', sans-serif;
		font-size: 14px;
		color: var(--gray-text);
	}

	.editor-actions {
		display: flex;
		gap: 8px;
		align-items: center;
	}

	.editor-reset-btn {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 4px 10px;
		border-radius: 4px;
		border: none;
		background: transparent;
		font-family: 'Noto Sans Thai', sans-serif;
		font-size: 12px;
		font-weight: 500;
		color: var(--gray-text);
		cursor: pointer;
		transition: background 0.15s;
	}

	.editor-reset-btn:hover {
		background: #f2f4f7;
	}

	.editor-run-btn {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 4px 14px;
		border-radius: 4px;
		border: none;
		background: var(--blue);
		font-family: 'Noto Sans Thai', sans-serif;
		font-size: 12px;
		font-weight: 500;
		color: var(--white);
		cursor: pointer;
		transition: opacity 0.15s;
	}

	.editor-run-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		background: #667085;
	}

	.editor-run-btn:hover {
		opacity: 0.9;
	}

	:global(.cm-editor) {
		min-height: 300px;
		font-size: 13px;
	}

	:global(.cm-scroller) {
		font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace !important;
		min-height: 300px;
	}

	:global(.cm-content) {
		font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace !important;
	}

	/* ─── Testcase box ──────────────────────────────────── */
	.testcase-box {
		background: var(--white);
		border: 1px solid var(--gray-border);
		border-radius: var(--radius);
		overflow: hidden;
		min-height: 200px;
	}

	.testcase-topbar {
		display: flex;
		align-items: center;
		padding: 0 16px;
		height: 36px;
		border-bottom: 1px solid #d9d9d9;
	}

	.testcase-tabs {
		display: flex;
		align-items: center;
	}

	.tc-tab-btn {
		background: none;
		border: none;
		cursor: pointer;
		font-family: 'Noto Sans Thai', sans-serif;
		font-size: 15px;
		font-weight: 400;
		color: var(--muted);
		padding: 0 12px 0 0;
		line-height: 36px;
		transition:
			color 0.15s,
			font-weight 0.1s;
	}

	.tc-tab-btn.tc-tab-active {
		font-weight: 700;
		color: var(--dark);
	}

	.tc-divider-line {
		display: inline-block;
		width: 1px;
		height: 16px;
		background: var(--gray-border);
		margin: 0 12px 0 0;
		vertical-align: middle;
	}

	.tc-summary-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 8px 16px;
		border-bottom: 1px solid #f2f4f7;
	}

	.tc-summary-label {
		font-family: 'Noto Sans Thai', sans-serif;
		font-size: 14px;
		font-weight: 700;
		color: var(--dark);
	}

	.tc-summary-detail {
		font-family: 'Noto Sans Thai', sans-serif;
		font-size: 12px;
		color: var(--gray-text);
	}

	.case-tabs {
		display: flex;
		gap: 8px;
		padding: 10px 16px 0;
	}

	.case-tab {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 4px 12px;
		border-radius: 4px;
		border: 1.5px solid var(--gray-border);
		background: var(--white);
		font-family: 'Noto Sans Thai', sans-serif;
		font-size: 13px;
		font-weight: 500;
		color: var(--gray-text);
		cursor: pointer;
		transition: all 0.15s;
	}

	.case-tab.active {
		background: var(--blue);
		border-color: var(--blue);
		color: var(--white);
	}

	.case-tab.passed:not(.active) {
		border-color: #22c55e;
		color: #15803d;
	}

	.case-tab.failed:not(.active) {
		border-color: #ef4444;
		color: #dc2626;
	}

	.case-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
	}

	.case-dot.green {
		background: #22c55e;
	}
	.case-dot.red {
		background: #ef4444;
	}

	.case-detail {
		padding: 12px 16px;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.case-io-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
	}

	.io-block {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.io-block.full {
		width: 100%;
	}

	.io-label {
		font-family: 'Noto Sans Thai', sans-serif;
		font-size: 11px;
		font-weight: 700;
		color: var(--muted);
		text-transform: uppercase;
		letter-spacing: 0.4px;
	}

	.io-pre {
		background: #f6f6f6;
		border-radius: 4px;
		padding: 8px 10px;
		font-family: 'JetBrains Mono', monospace;
		font-size: 12px;
		white-space: pre-wrap;
		word-break: break-all;
		margin: 0;
		min-height: 36px;
	}

	.io-pre.expected {
		color: #15803d;
	}
	.io-pre.passed-out {
		color: var(--dark);
	}
	.io-pre.failed-out {
		color: #dc2626;
	}

	.status-badge {
		display: inline-flex;
		align-items: center;
		margin-top: 4px;
		padding: 2px 10px;
		border-radius: 4px;
		font-size: 11px;
		font-weight: 700;
		font-family: 'Noto Sans Thai', sans-serif;
	}

	.status-badge.passed {
		background: #dcfce7;
		color: #15803d;
	}
	.status-badge.failed {
		background: #fee2e2;
		color: #dc2626;
	}

	.tc-empty {
		padding: 16px;
		font-family: 'Noto Sans Thai', sans-serif;
		font-size: 13px;
		color: var(--muted);
	}

	.tc-never-run {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 40px 24px;
		gap: 8px;
		text-align: center;
	}

	.tc-never-run-icon {
		color: var(--muted);
		opacity: 0.5;
		margin-bottom: 4px;
	}

	.tc-never-run-text {
		font-family: 'Noto Sans Thai', sans-serif;
		font-size: 15px;
		font-weight: 700;
		color: var(--dark);
		margin: 0;
	}

	.tc-never-run-sub {
		font-family: 'Noto Sans Thai', sans-serif;
		font-size: 13px;
		color: var(--muted);
		margin: 0;
	}

	/* ─── Single col layout ─────────────────────────────── */
	.single-col-layout {
		max-width: 860px;
		margin: 0 auto;
	}

	.question-card {
		padding: 0;
	}

	.divider {
		border-bottom: 2px solid var(--gray-border);
		margin: 4px 0 16px;
	}

	.choices-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		padding: 0 16px 16px;
	}

	.choice-card {
		width: calc(50% - 6px);
		max-height: 200px;
		overflow: auto;
		padding: 12px 16px;
		background: var(--white);
		border: 1.5px solid var(--gray-border);
		border-radius: var(--radius);
		cursor: pointer;
		transition:
			border-color 0.15s,
			box-shadow 0.15s;
	}

	.choice-card:hover {
		border-color: var(--blue);
	}

	:global(.choice-card:has(input[type='radio']:checked)),
	:global(.choice-card:has(input[type='checkbox']:checked)) {
		border-color: var(--blue);
		box-shadow: 0 0 0 3px var(--blue-light);
		background: var(--blue-bg);
	}

	.text-answer-area {
		width: 100%;
		height: 100%;
		resize: none;
		border: 1.5px solid var(--gray-border);
		border-radius: var(--radius);
		padding: 10px 14px;
		font-family: 'Noto Sans Thai', sans-serif;
		font-size: 15px;
		background: var(--white);
		color: var(--dark);
		outline: none;
		transition: border-color 0.15s;
	}

	.text-answer-area:focus {
		border-color: var(--blue);
	}

	.char-counter {
		position: absolute;
		bottom: 6px;
		right: 8px;
		background: rgba(255, 255, 255, 0.85);
		padding: 2px 8px;
		border-radius: 6px;
		font-size: 12px;
		color: var(--muted);
	}

	.char-counter.warn {
		color: var(--dark);
	}
	.char-counter.over {
		color: #dc2626;
	}

	.file-upload-area {
		padding: 0 16px 16px;
		position: relative;
	}

	.file-drop-zone {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		border: 2px dashed var(--gray-border);
		border-radius: var(--radius);
		padding: 24px;
		cursor: pointer;
		transition: border-color 0.15s;
	}

	.file-drop-zone:hover {
		border-color: var(--blue);
	}

	.file-upload-icon {
		width: 80px;
		height: 80px;
		object-fit: contain;
	}

	.file-upload-title {
		font-family: 'Noto Sans Thai', sans-serif;
		font-size: 16px;
		font-weight: 600;
		color: var(--dark);
		margin-top: 4px;
	}

	.file-upload-meta {
		font-family: 'Noto Sans Thai', sans-serif;
		font-size: 14px;
		color: var(--muted);
		margin-top: 4px;
	}

	.file-input-hidden {
		position: absolute;
		inset: 0;
		opacity: 0;
		cursor: pointer;
	}

	.file-existing {
		padding: 0 16px 16px;
	}

	.file-card {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		padding: 16px;
		background: #f9fafb;
		border-radius: var(--radius);
		width: fit-content;
		margin: 0 auto;
	}

	.file-link {
		display: flex;
		align-items: center;
		gap: 6px;
		font-family: 'Noto Sans Thai', sans-serif;
		font-size: 14px;
		color: var(--blue);
		text-decoration: underline;
	}

	.file-remove-btn {
		color: var(--muted);
		cursor: pointer;
		display: flex;
		align-items: center;
	}

	.error-msg {
		display: block;
		margin: 8px 16px 0;
		font-family: 'Noto Sans Thai', sans-serif;
		font-size: 14px;
		color: #dc2626;
	}

	/* ─── Footer ────────────────────────────────────────── */
	.exam-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 32px;
		height: 72px;
		background: var(--white);
		border-top: 1px solid #eaecf0;
		gap: 16px;
		position: sticky;
		bottom: 0;
		z-index: 40;
	}

	/*.footer-progress {
		flex: 1;
		max-width: 600px;
	}

	.footer-progress-labels {
		display: flex;
		justify-content: space-between;
		font-family: 'Noto Sans Thai', sans-serif;
		font-size: 13px;
		font-weight: 500;
		color: var(--dark);
		margin-bottom: 4px;
	}

	.footer-progress-track {
		width: 100%;
		height: 14px;
		background: var(--gray-border);
		border-radius: 100px;
		overflow: hidden;
	}

	.footer-progress-fill {
		height: 100%;
		background: var(--blue);
		border-radius: 100px;
		transition: width 0.4s;
	}*/

	.footer-right {
		display: flex;
		gap: 8px;
		align-items: center;
	}

	.footer-btn {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 8px 18px;
		border-radius: 100px;
		font-family: 'Noto Sans Thai', sans-serif;
		font-size: 15px;
		font-weight: 500;
		cursor: pointer;
		position: relative;
		transition:
			background 0.15s,
			border-color 0.15s;
		text-decoration: none;
		white-space: nowrap;
	}

	.outline-btn {
		background: var(--white);
		border: 1.5px solid var(--gray-border);
		color: var(--gray-text);
	}

	.outline-btn:hover {
		background: #f9fafb;
		border-color: var(--blue);
		color: var(--blue);
	}

	:global(.primary-btn) {
		background: var(--blue) !important;
		border: 1.5px solid var(--blue) !important;
		color: var(--white) !important;
		display: flex !important;
		align-items: center !important;
		gap: 6px !important;
		padding: 8px 18px !important;
		border-radius: 100px !important;
		font-family: 'Noto Sans Thai', sans-serif !important;
		font-size: 15px !important;
		font-weight: 500 !important;
		cursor: pointer !important;
		transition: opacity 0.15s !important;
	}

	:global(.primary-btn:hover) {
		opacity: 0.9 !important;
	}

	/* ─── Utility ───────────────────────────────────────── */
	label .hidden-submit {
		position: absolute;
		inset: 0;
		opacity: 0;
		cursor: pointer;
		width: 100%;
		height: 100%;
	}

	.hidden-submit:not(label *) {
		display: none;
	}

	@media (max-width: 900px) {
		.code-layout {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 600px) {
		.choice-card {
			width: 100%;
		}
		.exam-topbar-inner,
		.exam-footer {
			padding: 0 12px;
		}
	}
</style>
