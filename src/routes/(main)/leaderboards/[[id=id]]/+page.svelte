<script lang="ts">
	import { LoaderCircle, Pencil, Plus, Trash2 } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	import { afterNavigate } from '$app/navigation';
	import { base } from '$app/paths';

	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { configConstants } from '$lib/config-constants.js';
	import { roles } from '$lib/enums';
	import { getErrorMessage } from '$lib/error';
	import { formatNumberOptional } from '$lib/format-number';
	import { isRoleAtLeast } from '$lib/roles';

	import {
		createLeaderboardFormSchema,
		deleteLeaderboardFormSchema,
		updateLeaderboardFormSchema
	} from './schema.js';

	import badge_1 from '$lib/images/badge-1.avif';
	import badge_2 from '$lib/images/badge-2.avif';
	import badge_3 from '$lib/images/badge-3.avif';

	let { data } = $props();

	let isCreateLeaderboardDialogOpen = $state(false);

	const createLeaderboardForm = superForm(data.createLeaderboardForm, {
		validators: zodClient(createLeaderboardFormSchema),
		delayMs: configConstants.forms.delay,
		timeoutMs: configConstants.forms.timeout,
		onUpdated({ form }) {
			if (form.message) {
				switch (form.message.type) {
					case 'success':
						toast.success(form.message.text);
						isCreateLeaderboardDialogOpen = false;
						break;
					case 'info':
						toast.info(form.message.text);
						isCreateLeaderboardDialogOpen = false;
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
		form: createLeaderboardFormData,
		enhance: createLeaderboardEnhance,
		delayed: createLeaderboardDelayed
	} = createLeaderboardForm;

	let isUpdateLeaderboardDialogOpen = $state(false);

	const updateLeaderboardForm = superForm(data.updateLeaderboardForm, {
		validators: zodClient(updateLeaderboardFormSchema),
		delayMs: configConstants.forms.delay,
		timeoutMs: configConstants.forms.timeout,
		onUpdated({ form }) {
			if (form.message) {
				switch (form.message.type) {
					case 'success':
						toast.success(form.message.text);
						isUpdateLeaderboardDialogOpen = false;
						break;
					case 'info':
						toast.info(form.message.text);
						isUpdateLeaderboardDialogOpen = false;
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
		form: updateLeaderboardFormData,
		enhance: updateLeaderboardEnhance,
		delayed: updateLeaderboardDelayed
	} = updateLeaderboardForm;

	function openUpdateLeaderboardDialog(leaderboard: {
		id: string;
		name: string;
		order: number;
		exams: { id: string }[];
	}): void {
		$updateLeaderboardFormData.id = leaderboard.id;
		$updateLeaderboardFormData.name = leaderboard.name;
		$updateLeaderboardFormData.order = leaderboard.order.toString();
		$updateLeaderboardFormData.exams = leaderboard.exams.map((e) => e.id);
		isUpdateLeaderboardDialogOpen = true;
	}

	let isDeleteLeaderboardDialogOpen = $state(false);

	const deleteLeaderboardForm = superForm(data.deleteLeaderboardForm, {
		validators: zodClient(deleteLeaderboardFormSchema),
		delayMs: configConstants.forms.delay,
		timeoutMs: configConstants.forms.timeout,
		onUpdated({ form }) {
			if (form.message) {
				switch (form.message.type) {
					case 'success':
						toast.success(form.message.text);
						isDeleteLeaderboardDialogOpen = false;
						break;
					case 'info':
						toast.info(form.message.text);
						isDeleteLeaderboardDialogOpen = false;
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
		form: deleteLeaderboardFormData,
		enhance: deleteLeaderboardEnhance,
		delayed: deleteLeaderboardDelayed
	} = deleteLeaderboardForm;

	function openDeleteLeaderboardDialog(id: string): void {
		$deleteLeaderboardFormData.id = id;
		isDeleteLeaderboardDialogOpen = true;
	}

	afterNavigate(() => {
		isCreateLeaderboardDialogOpen = false;
		isUpdateLeaderboardDialogOpen = false;
		isDeleteLeaderboardDialogOpen = false;
	});
</script>

<svelte:head>
	<title>CE Next Gen AI - Leaderboards</title>
</svelte:head>

<div class="mx-auto mt-6 max-w-7xl px-16">
	<div class="mb-6 flex items-center justify-center gap-4">
		{#if isRoleAtLeast(data.user?.role, roles.teacher)}
			<Dialog.Root bind:open={isCreateLeaderboardDialogOpen}>
				<Dialog.Trigger
					class="flex h-12 w-12 items-center justify-center rounded-full bg-secondary-foreground text-white transition-colors hover:bg-primary-foreground">
					<Plus size={28} />
				</Dialog.Trigger>
				<Dialog.Content class="scrollba max-h-[80dvh] overflow-y-auto">
					<Dialog.Header>
						<Dialog.Title class="text-lg">Create leaderboard</Dialog.Title>
					</Dialog.Header>
					<form method="POST" action="?/create-leaderboard" use:createLeaderboardEnhance>
						<Form.Field form={createLeaderboardForm} name="name" class="mb-4 w-full">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label class="text-lg text-primary-foreground">Name</Form.Label>
									<Input
										{...props}
										bind:value={$createLeaderboardFormData.name}
										class="rounded-xl border-2 border-secondary-foreground bg-white px-3 py-1 !text-base font-medium text-primary-foreground placeholder:text-neutral-300" />
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
						<Form.Field form={createLeaderboardForm} name="order" class="mb-4 w-full">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label class="text-lg text-primary-foreground">Order</Form.Label>
									<Form.Description class="!mt-0">
										Lower number means this leaderboard will appear earlier in the listing
									</Form.Description>
									<Input
										{...props}
										bind:value={$createLeaderboardFormData.order}
										class="rounded-xl border-2 border-secondary-foreground bg-white px-3 py-1 !text-base font-medium text-primary-foreground placeholder:text-neutral-300" />
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
						<Form.Fieldset form={createLeaderboardForm} name="exams" class="mb-2 space-y-1">
							<Form.Legend class="text-lg font-normal text-primary-foreground">Exams</Form.Legend>
							<Form.Description class="!mb-2 !mt-0">
								Exams to be included in the leaderboard
							</Form.Description>
							{#each data.exams as exam (exam.id)}
								<Form.Control>
									{#snippet children({ props })}
										<div class="flex items-center gap-2">
											<input
												type="checkbox"
												{...props}
												value={exam.id}
												bind:group={$createLeaderboardFormData.exams}
												class="ml-2 size-4 cursor-pointer" />
											<Form.Label class="text-primary-foreground">
												{exam.title}
											</Form.Label>
										</div>
									{/snippet}
								</Form.Control>
							{/each}
							<Form.FieldErrors />
						</Form.Fieldset>
						<Form.Button
							class="button-gradient flex w-full items-center gap-2 rounded-xl text-lg text-white drop-shadow-lg">
							{#if $createLeaderboardDelayed}
								<LoaderCircle class="animate-spin" />
							{/if}
							Create
						</Form.Button>
					</form>
				</Dialog.Content>
			</Dialog.Root>
			<Dialog.Root bind:open={isUpdateLeaderboardDialogOpen}>
				<Dialog.Content class="scrollba max-h-[80dvh] overflow-y-auto">
					<Dialog.Header>
						<Dialog.Title class="text-lg">Update leaderboard</Dialog.Title>
					</Dialog.Header>
					<form method="POST" action="?/update-leaderboard" use:updateLeaderboardEnhance>
						<Form.Field form={updateLeaderboardForm} name="id">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label class="hidden">Leaderboard ID</Form.Label>
									<Input
										{...props}
										type="hidden"
										bind:value={$updateLeaderboardFormData.id}
										readonly />
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
						<Form.Field form={updateLeaderboardForm} name="name" class="mb-4 w-full">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label class="text-lg text-primary-foreground">Name</Form.Label>
									<Input
										{...props}
										bind:value={$updateLeaderboardFormData.name}
										class="rounded-xl border-2 border-secondary-foreground bg-white px-3 py-1 !text-base font-medium text-primary-foreground placeholder:text-neutral-300" />
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
						<Form.Field form={updateLeaderboardForm} name="order" class="mb-4 w-full">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label class="text-lg text-primary-foreground">Order</Form.Label>
									<Form.Description class="!mt-0">
										Lower number means this leaderboard will appear earlier in the listing
									</Form.Description>
									<Input
										{...props}
										bind:value={$updateLeaderboardFormData.order}
										class="rounded-xl border-2 border-secondary-foreground bg-white px-3 py-1 !text-base font-medium text-primary-foreground placeholder:text-neutral-300" />
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
						<Form.Fieldset form={updateLeaderboardForm} name="exams" class="mb-2 space-y-1">
							<Form.Legend class="text-lg font-normal text-primary-foreground">Exams</Form.Legend>
							<Form.Description class="!mb-2 !mt-0">
								Exams to be included in the leaderboard
							</Form.Description>
							{#each data.exams as exam (exam.id)}
								<Form.Control>
									{#snippet children({ props })}
										<div class="flex items-center gap-2">
											<input
												type="checkbox"
												{...props}
												value={exam.id}
												bind:group={$updateLeaderboardFormData.exams}
												class="ml-2 size-4 cursor-pointer" />
											<Form.Label class="text-primary-foreground">
												{exam.title}
											</Form.Label>
										</div>
									{/snippet}
								</Form.Control>
							{/each}
							<Form.FieldErrors />
						</Form.Fieldset>
						<Form.Button
							class="button-gradient flex w-full items-center gap-2 rounded-xl text-lg text-white drop-shadow-lg">
							{#if $updateLeaderboardDelayed}
								<LoaderCircle class="animate-spin" />
							{/if}
							Update
						</Form.Button>
					</form>
				</Dialog.Content>
			</Dialog.Root>
			<AlertDialog.Root bind:open={isDeleteLeaderboardDialogOpen}>
				<AlertDialog.Content>
					<AlertDialog.Header>
						<AlertDialog.Title>Confirm Leaderboard deletion</AlertDialog.Title>
						<AlertDialog.Description class="text-base text-gray-700">
							Are you sure you want to delete this leaderboard? Score data will not be affected, but
							the leaderboard will be gone forever.
						</AlertDialog.Description>
					</AlertDialog.Header>
					<form method="POST" action="?/delete-leaderboard" use:deleteLeaderboardEnhance>
						<Form.Field form={deleteLeaderboardForm} name="id">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label class="hidden">Leaderboard ID</Form.Label>
									<Input
										{...props}
										type="hidden"
										bind:value={$deleteLeaderboardFormData.id}
										readonly />
								{/snippet}
							</Form.Control>
						</Form.Field>
						<AlertDialog.Footer>
							<AlertDialog.Cancel
								type="button"
								class="flex cursor-pointer items-center justify-center rounded-full border-2 border-accent-foreground bg-white px-4 py-1 text-lg font-semibold text-accent-foreground drop-shadow-lg hover:bg-secondary">
								Cancel
							</AlertDialog.Cancel>
							<AlertDialog.Action
								type="submit"
								class="button-gradient relative flex items-center justify-center rounded-full px-5 py-1.5 text-lg font-semibold text-white drop-shadow-lg">
								{#if $deleteLeaderboardDelayed}
									<LoaderCircle class="animate-spin" />
								{/if}
								Delete
							</AlertDialog.Action>
						</AlertDialog.Footer>
					</form>
				</AlertDialog.Content>
			</AlertDialog.Root>
		{/if}
		<h1 class="text-center text-5xl font-semibold">Leaderboards</h1>
	</div>
	<div class="flex flex-wrap gap-4 rounded-xl bg-white p-4">
		{#each data.leaderboards as leaderboard (leaderboard.id)}
			<a
				href={`${base}/leaderboards/${leaderboard.id}`}
				class:bg-accent={data.leaderboard?.id === leaderboard.id}
				class:text-white={data.leaderboard?.id === leaderboard.id}
				class:font-semibold={data.leaderboard?.id === leaderboard.id}
				class:drop-shadow-lg={data.leaderboard?.id === leaderboard.id}
				class:!border-none={data.leaderboard?.id === leaderboard.id}
				class="flex items-center gap-2 rounded-full border border-gray-400 px-4 py-2">
				{#if isRoleAtLeast(data.user?.role, roles.teacher)}
					<button
						onclick={(event): void => {
							event.preventDefault();
							openUpdateLeaderboardDialog(leaderboard);
						}}
						class="m-0 flex size-6 items-center justify-center p-0">
						<Pencil />
					</button>
					<button
						onclick={(event): void => {
							event.preventDefault();
							openDeleteLeaderboardDialog(leaderboard.id);
						}}
						class="m-0 flex size-6 items-center justify-center p-0 text-red-500">
						<Trash2 />
					</button>
				{/if}
				{leaderboard.name}
			</a>
		{:else}
			<span class="text-gray-700 font-medium">No leaderboard available</span>
		{/each}
	</div>
	<div
		style="width: calc(33% - 2rem);"
		class:!bg-accent-foreground={(data.scores ?? [])[0]?.user?.id === (data.user?.id ?? null)}
		class="mx-auto mt-28 flex flex-col items-center rounded-xl bg-white p-4 drop-shadow-lg">
		<img
			src={badge_1}
			width="256"
			height="364"
			alt="Badge 1"
			class="absolute -top-20 h-fit w-48 drop-shadow-lg" />
		<span
			class:!text-white={(data.scores ?? [])[0]?.user?.id === (data.user?.id ?? null)}
			class="mb-4 mt-52 block max-w-full overflow-hidden text-ellipsis text-nowrap text-4xl font-bold text-accent-foreground">
			{(data.scores ?? [])[0]?.user?.prefix ?? ''}{(data.scores ?? [])[0]?.user?.name ?? 'None'}
		</span>
		<span
			class:!text-white={(data.scores ?? [])[0]?.user?.id === (data.user?.id ?? null)}
			class="text-2xl font-semibold text-primary-foreground">
			{formatNumberOptional((data.scores ?? [])[0]?.score, false, 100_000) ?? '-'}
		</span>
	</div>
	<div class="-mt-96 mb-12 flex justify-between">
		<div
			style="width: calc(33% - 2rem);"
			class:!bg-accent-foreground={(data.scores ?? [])[1]?.user?.id === (data.user?.id ?? null)}
			class="mt-32 flex flex-col items-center rounded-xl bg-white p-4 drop-shadow-lg">
			<img
				src={badge_2}
				width="256"
				height="364"
				alt="Badge 2"
				class="absolute -top-20 h-fit w-48 drop-shadow-lg" />
			<span
				class:!text-white={(data.scores ?? [])[1]?.user?.id === (data.user?.id ?? null)}
				class="mb-4 mt-52 block max-w-full overflow-hidden text-ellipsis text-nowrap text-4xl font-bold text-accent-foreground">
				{(data.scores ?? [])[1]?.user?.prefix ?? ''}{(data.scores ?? [])[1]?.user?.name ?? 'None'}
			</span>
			<span
				class:!text-white={(data.scores ?? [])[1]?.user?.id === (data.user?.id ?? null)}
				class="text-2xl font-semibold text-primary-foreground">
				{formatNumberOptional((data.scores ?? [])[1]?.score, false, 100_000) ?? '-'}
			</span>
		</div>
		<div
			style="width: calc(33% - 2rem);"
			class:!bg-accent-foreground={(data.scores ?? [])[2]?.user?.id === (data.user?.id ?? null)}
			class="mt-32 flex flex-col items-center rounded-xl bg-white p-4 drop-shadow-lg">
			<img
				src={badge_3}
				width="256"
				height="364"
				alt="Badge 3"
				class="absolute -top-20 h-fit w-48 drop-shadow-lg" />
			<span
				class:!text-white={(data.scores ?? [])[2]?.user?.id === (data.user?.id ?? null)}
				class="mb-4 mt-52 block max-w-full overflow-hidden text-ellipsis text-nowrap text-4xl font-bold text-accent-foreground">
				{(data.scores ?? [])[2]?.user?.prefix ?? ''}{(data.scores ?? [])[2]?.user?.name ?? 'None'}
			</span>
			<span
				class:!text-white={(data.scores ?? [])[2]?.user?.id === (data.user?.id ?? null)}
				class="text-2xl font-semibold text-primary-foreground">
				{formatNumberOptional((data.scores ?? [])[2]?.score, false, 100_000) ?? '-'}
			</span>
		</div>
	</div>
	<div class="mb-12 space-y-4">
		{#each (data.scores ?? []).slice(3) as score, index (score.user.id)}
			<div
				class:!bg-accent-foreground={score.user.id === data.user?.id}
				class:!text-white={score.user.id === data.user?.id}
				class="flex items-center rounded-xl bg-white px-12 py-6 text-xl font-medium text-primary-foreground drop-shadow-lg">
				<span class="w-28">
					{index + 4}
					<sup>th</sup>
				</span>
				<span class="block w-0 flex-grow overflow-hidden text-ellipsis text-nowrap">
					{score.user.prefix}{score.user.name}
				</span>
				<span class="block w-32 overflow-hidden text-ellipsis text-nowrap text-right">
					{formatNumberOptional(score.score, false, 100_000)}
				</span>
			</div>
		{/each}
	</div>
	{#if !data.scores?.find((v) => v.user.id === data.user?.id)}
		<div
			class="flex items-center rounded-xl bg-accent-foreground px-12 py-6 text-xl font-medium text-white drop-shadow-lg">
			<span class="w-28">Unranked</span>
			<span class="block w-0 flex-grow overflow-hidden text-ellipsis text-nowrap">
				{data.user?.prefix ?? ''}{data.user?.name ?? 'Unknown'}
			</span>
			<span class="block w-32 overflow-hidden text-ellipsis text-nowrap text-right">
				{formatNumberOptional(data.userScore, false, 100_000) ?? '-'}
			</span>
		</div>
	{/if}
</div>
