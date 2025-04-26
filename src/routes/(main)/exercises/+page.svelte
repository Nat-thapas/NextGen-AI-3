<script lang="ts">
	import { LoaderCircle, Plus } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { fileProxy, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	import * as Dialog from '$lib/components/ui/dialog';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { configConstants } from '$lib/config-constants';
	import { roles } from '$lib/enums';
	import { getErrorMessage } from '$lib/error';
	import { isRoleAtLeast } from '$lib/roles';

	import ExamCard from './exam-card.svelte';
	import { formSchema } from './schema';

	let { data } = $props();

	let isFormDialogOpen = $state(false);

	const form = superForm(data.form, {
		validators: zodClient(formSchema),
		resetForm: false,
		delayMs: configConstants.forms.delay,
		timeoutMs: configConstants.forms.longTimeout,
		onUpdated({ form }) {
			if (form.message) {
				switch (form.message.type) {
					case 'success':
						toast.success(form.message.text);
						isFormDialogOpen = false;
						break;
					case 'info':
						toast.info(form.message.text);
						isFormDialogOpen = false;
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

	let file = fileProxy(form, 'file');
</script>

<svelte:head>
	<title>CE Next Gen AI - Exercises</title>
</svelte:head>

<div class="mx-auto mt-6 max-w-7xl px-16">
	<div class="mb-6 flex items-center justify-center gap-4">
		{#if isRoleAtLeast(data.user?.role, roles.teacher)}
			<Dialog.Root bind:open={isFormDialogOpen}>
				<Dialog.Trigger
					class="flex h-12 w-12 items-center justify-center rounded-full bg-secondary-foreground text-white transition-colors hover:bg-primary-foreground">
					<Plus size={28} />
				</Dialog.Trigger>
				<Dialog.Content class="max-h-[80dvh] overflow-y-scroll">
					<Dialog.Header>
						<Dialog.Title class="text-lg">Create exam</Dialog.Title>
						<Dialog.Description class="text-base text-primary-foreground">
							Upload a .zip file containing the exam data in excel (.xlsx) format and your assets.
							For more instruction please visit
							<a class="underline" href="/instructions/upload-contents">how to upload contents</a>
						</Dialog.Description>
					</Dialog.Header>
					<form method="POST" enctype="multipart/form-data" use:enhance>
						<Form.Field {form} name="title" class="mb-4 w-full">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label class="text-lg text-primary-foreground">Title</Form.Label>
									<Input
										{...props}
										bind:value={$formData.title}
										class="rounded-xl border-2 border-secondary-foreground bg-white px-3 py-1 !text-base font-medium text-primary-foreground placeholder:text-secondary-foreground" />
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
						<Form.Field {form} name="description" class="mb-4 w-full">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label class="text-lg text-primary-foreground">Description</Form.Label>
									<Input
										{...props}
										bind:value={$formData.description}
										class="rounded-xl border-2 border-secondary-foreground bg-white px-3 py-1 !text-base font-medium text-primary-foreground placeholder:text-secondary-foreground" />
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
						<Form.Field {form} name="openAt" class="mb-4 w-full">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label class="text-lg text-primary-foreground">Open at</Form.Label>
									<Input
										{...props}
										type="datetime-local"
										bind:value={$formData.openAt}
										class="rounded-xl border-2 border-secondary-foreground bg-white px-3 py-1 !text-base font-medium text-primary-foreground placeholder:text-secondary-foreground" />
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
						<Form.Field {form} name="closeAt" class="mb-4 w-full">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label class="text-lg text-primary-foreground">Close at</Form.Label>
									<Input
										{...props}
										type="datetime-local"
										bind:value={$formData.closeAt}
										class="rounded-xl border-2 border-secondary-foreground bg-white px-3 py-1 !text-base font-medium text-primary-foreground placeholder:text-secondary-foreground" />
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
						<Form.Field {form} name="timeLimit" class="mb-4 w-full">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label class="text-lg text-primary-foreground">
										Time limit (seconds)
									</Form.Label>
									<Input
										{...props}
										bind:value={$formData.timeLimit}
										class="rounded-xl border-2 border-secondary-foreground bg-white px-3 py-1 !text-base font-medium text-primary-foreground placeholder:text-secondary-foreground" />
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
						<Form.Field {form} name="file" class="mb-4 w-full">
							<Form.Control>
								{#snippet children({ props })}
									<div class="flex items-center gap-2">
										<Form.Label class="text-lg text-primary-foreground">Upload file</Form.Label>
									</div>
									<input
										{...props}
										bind:files={$file}
										type="file"
										accept="application/zip, application/zip-compressed, application/x-zip-compressed, multipart/x-zip"
										class="flex h-10 w-full cursor-pointer rounded-xl border-2 border-secondary-foreground bg-white px-3 py-1 !text-base font-medium text-primary-foreground ring-offset-background file:border-0 file:bg-transparent file:text-base file:font-medium file:text-secondary-foreground file:transition-colors placeholder:text-secondary-foreground file:hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm" />
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
						<Form.Button
							class="button-gradient flex w-full items-center gap-2 rounded-xl text-lg text-white drop-shadow-lg">
							{#if $delayed}
								<LoaderCircle class="animate-spin" />
							{/if}
							Create
						</Form.Button>
					</form>
				</Dialog.Content>
			</Dialog.Root>
		{/if}
		<h1 class="text-center text-5xl font-semibold">Exercises</h1>
	</div>
	<h2 class="mb-2 text-3xl font-semibold">Available</h2>
	<div class="mb-8 space-y-4">
		{#each data.availableExams as exam (exam.id)}
			<ExamCard
				{exam}
				color={exam.attempted ? 'blue' : 'green'}
				isExamAvailable={true}
				timeZone={data.timeZone} />
		{:else}
			<span class="block w-full text-center">No exercise available</span>
		{/each}
	</div>
	<h2 class="mb-2 text-3xl font-semibold">Upcoming</h2>
	<div class="mb-8 space-y-4">
		{#each data.upcomingExams as exam (exam.id)}
			<ExamCard {exam} color="amber" timeZone={data.timeZone} />
		{:else}
			<span class="block w-full text-center">No exercise upcoming</span>
		{/each}
	</div>
	<h2 class="mb-2 text-3xl font-semibold">Completed</h2>
	<div class="mb-8 space-y-4">
		{#each data.completedExams as exam (exam.id)}
			<ExamCard {exam} color="gray" timeZone={data.timeZone} />
		{:else}
			<span class="block w-full text-center">No exercise completed</span>
		{/each}
	</div>
	<h2 class="mb-2 text-3xl font-semibold">Expired</h2>
	<div class="mb-8 space-y-4">
		{#each data.expiredExams as exam (exam.id)}
			<ExamCard {exam} color="red" timeZone={data.timeZone} />
		{:else}
			<span class="block w-full text-center">No exercise expired</span>
		{/each}
	</div>
</div>
