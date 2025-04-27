<script lang="ts">
	import { ChevronLeft, ChevronRight } from '@lucide/svelte';
	import mimeTypes from 'mime-types';
	import { toast } from 'svelte-sonner';
	import { MediaQuery } from 'svelte/reactivity';
	import { superForm, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { z } from 'zod';

	import { Progress } from '$lib/components/ui/progress';
	import { configConstants } from '$lib/config-constants.js';
	import { questionTypes } from '$lib/enums.js';
	import { getErrorMessage } from '$lib/error.js';
	import { formatNumber } from '$lib/format-number.js';
	import type { PartialExam } from '$lib/interfaces/exam';
	import type { PartialQuestionAnswer, Question } from '$lib/interfaces/question';
	import type { PartialSubmission } from '$lib/interfaces/submission';

	let {
		data
	}: {
		data: {
			exam: PartialExam;
			questions: PartialQuestionAnswer[];
			submission: PartialSubmission;
			question: Question;
			form: SuperValidated<any>;
		};
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

	let formSchema;

	switch (data.question.questionType) {
		case questionTypes.choices:
			formSchema = z.object({
				next: z.string(),
				answer: z
					.string()
					.refine((v) => /[0-9]{1,15}/.test(v), 'Choice must be a valid number')
					.optional()
			});
			break;
		case questionTypes.checkboxes:
			formSchema = z.object({
				next: z.string(),
				answer: z
					.string()
					.refine((v) => /[0-9]{1,15}/.test(v), 'Choice must be a valid number')
					.array()
					.optional()
			});
			break;
		case questionTypes.text:
			formSchema = z.object({
				next: z.string(),
				answer: z
					.string()
					.max(
						data.question.textLengthLimit,
						`Answer must be at most ${data.question.textLengthLimit} characters long`
					)
					.optional()
			});
			break;
		case questionTypes.file:
			formSchema = z.object({
				next: z.string(),
				answer: z
					.instanceof(File, { message: 'Please upload a file' })
					.refine(
						(f) =>
							data.question.fileTypes ? data.question.fileTypes.split(',').includes(f.type) : true,
						`File must be a supported file type (${(data.question.fileTypes ?? '')
							.split(',')
							.map((mimeType) => '.' + mimeTypes.lookup(mimeType) || '.dat')
							.join(', ')})`
					)
					.refine(
						(f) => f.size < data.question.fileSizeLimit * 1000,
						`File size must be at most ${formatNumber(data.question.fileSizeLimit * 1000)}B`
					)
					.optional()
			});
			break;
	}

	const form = superForm(data.form, {
		validators: zodClient(formSchema!),
		resetForm: false,
		delayMs: configConstants.forms.delay,
		timeoutMs: configConstants.forms.longTimeout,
		taintedMessage: true,
		onUpdated({ form }) {
			if (form.message) {
				switch (form.message.type) {
					case 'success':
						toast.success(form.message.text);
						break;
					case 'info':
						toast.info(form.message.text);
						break;
					case 'warning':
						toast.warning(form.message.text);
						break;
					case 'error':
						toast.error(form.message.text);
						break;
					default:
						toast(form.message.text);
						break;
				}
			}
		},
		onError({ result }) {
			toast.error(getErrorMessage(result.error));
		}
	});

	const { form: formData, enhance, delayed } = form;
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
		use:enhance>
		<div class="flex justify-between gap-8">
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
						for="back-button"
						class:!text-gray-400={data.question.number === 1}
						class:!bg-gray-300={data.question.number === 1}
						class:!border-gray-300={data.question.number === 1}
						class:!cursor-not-allowed={data.question.number === 1}
						class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2 border-secondary-foreground bg-white p-0 text-secondary-foreground transition-colors">
						<ChevronLeft size={28} />
						<input
							type="submit"
							id="back-button"
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
								class:!bg-gray-300={question.answers.length > 0}
								class:!border-gray-300={question.answers.length > 0}
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
	</form>
</div>
