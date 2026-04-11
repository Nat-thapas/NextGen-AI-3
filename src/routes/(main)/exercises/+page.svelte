<script lang="ts">
	import { LoaderCircle, Plus } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { fileProxy, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	import { base } from '$app/paths';

	import * as Dialog from '$lib/components/ui/dialog';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { configConstants } from '$lib/config-constants';
	import { roles } from '$lib/enums';
	import { getErrorMessage } from '$lib/error';
	import type { Exam } from '$lib/interfaces/exam';
	import { isRoleAtLeast } from '$lib/roles';

	import ExamCard from './exam-card.svelte';
	import { calculateScoreFormSchema, createExamFormSchema, uploadScoreFormSchema } from './schema';

	let { data } = $props();

	let isCreateExamDialogOpen = $state(false);

	const createExamForm = superForm(data.createExamForm, {
		validators: zodClient(createExamFormSchema),
		resetForm: false,
		delayMs: configConstants.forms.delay,
		timeoutMs: configConstants.forms.longTimeout,
		onUpdated({ form }) {
			if (form.message) {
				switch (form.message.type) {
					case 'success':
						toast.success(form.message.text);
						isCreateExamDialogOpen = false;
						createExamForm.reset();
						break;
					case 'info':
						toast.info(form.message.text);
						isCreateExamDialogOpen = false;
						createExamForm.reset();
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

	const {
		form: createExamFormData,
		enhance: createExamEnhance,
		delayed: createExamDelayed
	} = createExamForm;

	let examFile = fileProxy(createExamForm, 'file');

	let isCalculateScoreDialogOpen = $state(false);

	const calculateScoreForm = superForm(data.calculateScoreForm, {
		validators: zodClient(calculateScoreFormSchema),
		resetForm: false,
		invalidateAll: false,
		delayMs: configConstants.forms.delay,
		timeoutMs: configConstants.forms.longTimeout,
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

	const {
		form: calculateScoreFormData,
		enhance: calculateScoreEnhance,
		delayed: calculateScoreDelayed
	} = calculateScoreForm;

	const uploadScoreForm = superForm(data.uploadScoreForm, {
		validators: zodClient(uploadScoreFormSchema),
		resetForm: false,
		invalidateAll: false,
		delayMs: configConstants.forms.delay,
		timeoutMs: configConstants.forms.longTimeout,
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

	const {
		form: uploadScoreFormData,
		enhance: uploadScoreEnhance,
		delayed: uploadScoreDelayed
	} = uploadScoreForm;

	let scoreFile = fileProxy(uploadScoreForm, 'file');

	function showCalculateScoreDialog(exam: Exam): void {
		$calculateScoreFormData.examId = exam.id;
		$uploadScoreFormData.examId = exam.id;
		isCalculateScoreDialogOpen = true;
	}
</script>

<svelte:head>
	<title>NextGen AI - Exercises</title>
</svelte:head>

<div class="mx-auto mt-6 max-w-7xl px-4 md:px-16">
	<div class="mb-6 flex items-center justify-center gap-4">
		{#if isRoleAtLeast(data.user?.role, roles.teacher)}
			<Dialog.Root bind:open={isCreateExamDialogOpen}>
				<Dialog.Trigger
					class="flex h-12 w-12 items-center justify-center rounded-full bg-secondary-foreground text-white transition-colors hover:bg-primary-foreground">
					<Plus size={28} />
				</Dialog.Trigger>
				<Dialog.Content class="scrollba max-h-[80dvh] overflow-y-auto">
					<Dialog.Header>
						<Dialog.Title class="text-lg">Create exam</Dialog.Title>
						<Dialog.Description class="text-base text-primary-foreground">
							Upload a .zip file containing the exam data in excel (.xlsx) format and your assets.
							For more instruction please visit
							<a class="underline" href="/instructions/upload-contents">how to upload contents</a>
						</Dialog.Description>
					</Dialog.Header>
					<form
						method="POST"
						action="?/create-exam"
						enctype="multipart/form-data"
						use:createExamEnhance>
						<Form.Field form={createExamForm} name="title" class="mb-4 w-full">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label class="text-lg text-primary-foreground">Title</Form.Label>
									<Input
										{...props}
										bind:value={$createExamFormData.title}
										class="rounded-xl border-2 border-secondary-foreground bg-white px-3 py-1 !text-base font-medium text-primary-foreground placeholder:text-neutral-300" />
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
						<Form.Field form={createExamForm} name="description" class="mb-4 w-full">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label class="text-lg text-primary-foreground">Description</Form.Label>
									<Input
										{...props}
										bind:value={$createExamFormData.description}
										class="rounded-xl border-2 border-secondary-foreground bg-white px-3 py-1 !text-base font-medium text-primary-foreground placeholder:text-neutral-300" />
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
						<Form.Field form={createExamForm} name="openAt" class="mb-4 w-full">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label class="text-lg text-primary-foreground">Open at</Form.Label>
									<Input
										{...props}
										type="datetime-local"
										bind:value={$createExamFormData.openAt}
										class="rounded-xl border-2 border-secondary-foreground bg-white px-3 py-1 !text-base font-medium text-primary-foreground placeholder:text-neutral-300" />
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
						<Form.Field form={createExamForm} name="closeAt" class="mb-4 w-full">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label class="text-lg text-primary-foreground">Close at</Form.Label>
									<Input
										{...props}
										type="datetime-local"
										bind:value={$createExamFormData.closeAt}
										class="rounded-xl border-2 border-secondary-foreground bg-white px-3 py-1 !text-base font-medium text-primary-foreground placeholder:text-neutral-300" />
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
						<Form.Field form={createExamForm} name="timeLimit" class="mb-4 w-full">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label class="text-lg text-primary-foreground">
										Time limit (seconds)
									</Form.Label>
									<Input
										{...props}
										bind:value={$createExamFormData.timeLimit}
										class="rounded-xl border-2 border-secondary-foreground bg-white px-3 py-1 !text-base font-medium text-primary-foreground placeholder:text-neutral-300" />
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
						<Form.Field form={createExamForm} name="file" class="mb-4 w-full">
							<Form.Control>
								{#snippet children({ props })}
									<div class="flex items-center gap-2">
										<Form.Label class="text-lg text-primary-foreground">Upload file</Form.Label>
									</div>
									<input
										{...props}
										bind:files={$examFile}
										type="file"
										accept="application/zip, application/zip-compressed, application/x-zip-compressed, multipart/x-zip"
										class="flex h-10 w-full cursor-pointer rounded-xl border-2 border-secondary-foreground bg-white px-2 py-1.5 !text-base font-medium text-primary-foreground ring-offset-background file:border-0 file:bg-transparent file:text-base file:font-medium file:text-secondary-foreground file:transition-colors placeholder:text-neutral-300 file:hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm" />
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
						<Form.Button
							class="button-gradient flex w-full items-center gap-2 rounded-xl text-lg text-white drop-shadow-lg">
							{#if $createExamDelayed}
								<LoaderCircle class="animate-spin" />
							{/if}
							Create
						</Form.Button>
					</form>
				</Dialog.Content>
			</Dialog.Root>
			<Dialog.Root bind:open={isCalculateScoreDialogOpen}>
				<Dialog.Content class="max-h-[80dvh] overflow-y-auto">
					<Dialog.Header>
						<Dialog.Title class="text-lg">Exam score</Dialog.Title>
						<Dialog.Description class="text-base text-primary-foreground">
							The calculate function will calculate score for all submissions of the exam, <strong>
								this will override any existing score data
							</strong>
							. The download function will download current score data. If you have not perform a score
							calculation before, the downloaded data won't have any pre-calculated score.
						</Dialog.Description>
					</Dialog.Header>
					<form method="POST" action="?/calculate-score" use:calculateScoreEnhance>
						<Form.Field form={calculateScoreForm} name="examId">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label class="hidden">Exam ID</Form.Label>
									<Input
										{...props}
										type="hidden"
										bind:value={$calculateScoreFormData.examId}
										readonly />
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
						<div class="flex gap-2">
							<Form.Button
								class="button-gradient flex w-0 flex-grow items-center gap-2 rounded-xl text-lg text-white drop-shadow-lg">
								{#if $calculateScoreDelayed}
									<LoaderCircle class="animate-spin" />
								{/if}
								Calculate
							</Form.Button>
							<a
								href={`${base}/api/exams/${$calculateScoreFormData.examId}/score.xlsx`}
								download="score.xlsx"
								class="button-gradient flex h-10 w-0 flex-grow items-center justify-center gap-2 rounded-xl px-4 text-lg font-semibold text-white drop-shadow-lg">
								Download
							</a>
						</div>
					</form>
					<span class="-mb-4 text-lg font-semibold text-black">Upload score file</span>
					<form
						method="POST"
						action="?/upload-score"
						enctype="multipart/form-data"
						use:uploadScoreEnhance>
						<Form.Field form={uploadScoreForm} name="examId">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label class="hidden">Exam ID</Form.Label>
									<Input
										{...props}
										type="hidden"
										bind:value={$uploadScoreFormData.examId}
										readonly />
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
						<Form.Field form={uploadScoreForm} name="file" class="mb-4 w-full">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Description class="text-base text-primary-foreground">
										Once you have updated the score file, you can upload it here to update the score
										data.
										<strong>this will override any existing score data</strong>
									</Form.Description>
									<div class="flex items-center gap-2">
										<Form.Label class="sr-only text-primary-foreground">Upload file</Form.Label>
									</div>
									<input
										{...props}
										bind:files={$scoreFile}
										type="file"
										accept="application/vnd.ms-excel, application/msexcel, application/x-msexcel, application/x-ms-excel, application/x-excel, application/x-dos_ms_excel, application/xls, application/x-xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
										class="flex h-10 w-full cursor-pointer rounded-xl border-2 border-secondary-foreground bg-white px-2 py-1.5 !text-base font-medium text-primary-foreground ring-offset-background file:border-0 file:bg-transparent file:text-base file:font-medium file:text-secondary-foreground file:transition-colors placeholder:text-neutral-300 file:hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm" />
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
						<div class="flex gap-2">
							<Form.Button
								class="button-gradient flex w-0 flex-grow items-center gap-2 rounded-xl text-lg text-white drop-shadow-lg">
								{#if $uploadScoreDelayed}
									<LoaderCircle class="animate-spin" />
								{/if}
								Upload
							</Form.Button>
						</div>
					</form>
				</Dialog.Content>
			</Dialog.Root>
		{/if}
		<h1 class="text-center text-3xl font-semibold md:text-5xl">Exercises</h1>
	</div>
	<h2 class="mb-2 text-xl font-semibold md:text-3xl">Available</h2>
	<div class="mb-8 space-y-4">
		{#each data.availableExams as exam (exam.id)}
			<ExamCard
				user={data.user}
				{exam}
				onCalculateClick={(): void => showCalculateScoreDialog(exam)}
				color={exam.attempted ? 'blue' : 'green'}
				isExamAvailable={true}
				timeZone={data.timeZone} />
		{:else}
			<span class="block w-full text-center">No exercise available</span>
		{/each}
	</div>
	<h2 class="mb-2 text-xl font-semibold md:text-3xl">Upcoming</h2>
	<div class="mb-8 space-y-4">
		{#each data.upcomingExams as exam (exam.id)}
			<ExamCard
				user={data.user}
				{exam}
				onCalculateClick={(): void => showCalculateScoreDialog(exam)}
				color="amber"
				isExamAvailable={isRoleAtLeast(data.user?.role, roles.teacher)}
				timeZone={data.timeZone} />
		{:else}
			<span class="block w-full text-center">No exercise upcoming</span>
		{/each}
	</div>
	<h2 class="mb-2 text-xl font-semibold md:text-3xl">Completed</h2>
	<div class="mb-8 space-y-4">
		{#each data.completedExams as exam (exam.id)}
			<ExamCard
				user={data.user}
				{exam}
				onCalculateClick={(): void => showCalculateScoreDialog(exam)}
				color="gray"
				isExamAvailable={isRoleAtLeast(data.user?.role, roles.teacher)}
				timeZone={data.timeZone} />
		{:else}
			<span class="block w-full text-center">No exercise completed</span>
		{/each}
	</div>
	<h2 class="mb-2 text-xl font-semibold md:text-3xl">Expired</h2>
	<div class="mb-8 space-y-4">
		{#each data.expiredExams as exam (exam.id)}
			<ExamCard
				user={data.user}
				{exam}
				onCalculateClick={(): void => showCalculateScoreDialog(exam)}
				color="red"
				isExamAvailable={isRoleAtLeast(data.user?.role, roles.teacher)}
				timeZone={data.timeZone} />
		{:else}
			<span class="block w-full text-center">No exercise expired</span>
		{/each}
	</div>
</div>
