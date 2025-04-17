<script lang="ts">
	import { Download, LoaderCircle } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { fileProxy, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	import { base } from '$app/paths';

	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import * as Select from '$lib/components/ui/select';
	import { getErrorMessage } from '$lib/error.js';

	import { changePasswordSchema, formSchema } from './schema.js';

	let { data } = $props();

	const form = superForm(data.form, {
		validators: zodClient(formSchema),
		resetForm: false,
		delayMs: 100,
		timeoutMs: 5000,
		multipleSubmits: 'prevent',
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

	const changePasswordForm = superForm(data.changePasswordForm, {
		validators: zodClient(changePasswordSchema),
		delayMs: 100,
		timeoutMs: 5000,
		multipleSubmits: 'prevent',
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
		form: changePasswordFormData,
		enhance: changePasswordEnhance,
		delayed: changePasswordDelayed
	} = changePasswordForm;

	let file = fileProxy(form, 'transcript');
</script>

<svelte:head>
	<title>CE Next Gen AI - Profile</title>
</svelte:head>

<div class="mx-auto mt-8 max-w-6xl rounded-2xl bg-white p-8 px-16 drop-shadow-xl">
	<h1 class="mb-4 text-center text-4xl font-semibold">Profile</h1>
	<form
		method="POST"
		action="?/update-profile"
		enctype="multipart/form-data"
		use:enhance
		class="mb-8">
		<div class="mb-4 rounded-xl border-2 border-secondary-foreground p-4">
			<span class="mb-4 block text-xl font-semibold text-primary-foreground">
				Personal Information
			</span>
			<div class="flex">
				<div class="w-1/3 px-4">
					<Form.Field {form} name="prefix" class="mb-4 w-full">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label class="text-lg text-secondary-foreground">Prefix</Form.Label>
								<Input
									{...props}
									bind:value={$formData.prefix}
									class="rounded-xl border-2 border-secondary-foreground bg-white !text-lg font-medium text-primary-foreground placeholder:text-secondary-foreground" />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				</div>
				<div class="w-2/3 px-4">
					<Form.Field {form} name="name" class="mb-4 w-full">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label class="text-lg text-secondary-foreground">Name</Form.Label>
								<Input
									{...props}
									bind:value={$formData.name}
									class="rounded-xl border-2 border-secondary-foreground bg-white !text-lg font-medium text-primary-foreground placeholder:text-secondary-foreground" />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				</div>
			</div>
			<div class="flex">
				<div class="w-1/3 px-4">
					<Form.Field {form} name="nickname" class="mb-4 w-full">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label class="text-lg text-secondary-foreground">Nickname</Form.Label>
								<Input
									{...props}
									bind:value={$formData.nickname}
									class="rounded-xl border-2 border-secondary-foreground bg-white !text-lg font-medium text-primary-foreground placeholder:text-secondary-foreground" />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				</div>
				<div class="w-1/3 px-4">
					<Form.Field {form} name="phoneNumber" class="mb-4 w-full">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label class="text-lg text-secondary-foreground">Phone number</Form.Label>
								<Input
									{...props}
									bind:value={$formData.phoneNumber}
									class="rounded-xl border-2 border-secondary-foreground bg-white !text-lg font-medium text-primary-foreground placeholder:text-secondary-foreground" />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				</div>
				<div class="w-1/3 px-4">
					<span class="mb-2 block text-lg font-semibold text-secondary-foreground">Email</span>
					<input
						value={data.user?.email}
						readonly
						class="h-10 w-full rounded-xl border-2 border-secondary-foreground bg-white px-3 !text-lg font-medium text-primary-foreground placeholder:text-secondary-foreground" />
				</div>
			</div>
		</div>
		<div class="mb-4 rounded-xl border-2 border-secondary-foreground p-4">
			<span class="mb-4 block text-xl font-semibold text-primary-foreground">Address</span>
			<div class="flex">
				<div class="w-2/3 px-4">
					<Form.Field {form} name="addressDetail" class="mb-4 w-full">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label class="text-lg text-secondary-foreground">Detail</Form.Label>
								<Input
									{...props}
									bind:value={$formData.addressDetail}
									class="rounded-xl border-2 border-secondary-foreground bg-white !text-lg font-medium text-primary-foreground placeholder:text-secondary-foreground" />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				</div>
				<div class="w-1/3 px-4">
					<Form.Field {form} name="addressSubDistrict" class="mb-4 w-full">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label class="text-lg text-secondary-foreground">Sub-district</Form.Label>
								<Input
									{...props}
									bind:value={$formData.addressSubDistrict}
									class="rounded-xl border-2 border-secondary-foreground bg-white !text-lg font-medium text-primary-foreground placeholder:text-secondary-foreground" />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				</div>
			</div>
			<div class="flex">
				<div class="w-1/3 px-4">
					<Form.Field {form} name="addressDistrict" class="mb-4 w-full">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label class="text-lg text-secondary-foreground">District</Form.Label>
								<Input
									{...props}
									bind:value={$formData.addressDistrict}
									class="rounded-xl border-2 border-secondary-foreground bg-white !text-lg font-medium text-primary-foreground placeholder:text-secondary-foreground" />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				</div>
				<div class="w-1/3 px-4">
					<Form.Field {form} name="addressProvince" class="mb-4 w-full">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label class="text-lg text-secondary-foreground">Province</Form.Label>
								<Input
									{...props}
									bind:value={$formData.addressProvince}
									class="rounded-xl border-2 border-secondary-foreground bg-white !text-lg font-medium text-primary-foreground placeholder:text-secondary-foreground" />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				</div>
				<div class="w-1/3 px-4">
					<Form.Field {form} name="addressPostcode" class="mb-4 w-full">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label class="text-lg text-secondary-foreground">Postcode</Form.Label>
								<Input
									{...props}
									bind:value={$formData.addressPostcode}
									class="rounded-xl border-2 border-secondary-foreground bg-white !text-lg font-medium text-primary-foreground placeholder:text-secondary-foreground" />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				</div>
			</div>
		</div>
		<div class="mb-4 rounded-xl border-2 border-secondary-foreground p-4">
			<span class="mb-4 block text-xl font-semibold text-primary-foreground">Education</span>
			<div class="flex">
				<div class="w-1/3 px-4">
					<Form.Field {form} name="schoolName" class="mb-4 w-full">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label class="text-lg text-secondary-foreground">School</Form.Label>
								<Input
									{...props}
									bind:value={$formData.schoolName}
									class="rounded-xl border-2 border-secondary-foreground bg-white !text-lg font-medium text-primary-foreground placeholder:text-secondary-foreground" />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				</div>
				<div class="w-1/3 px-4">
					<Form.Field {form} name="grade" class="mb-4 w-full">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label class="text-lg text-secondary-foreground">Grade</Form.Label>
								<Select.Root type="single" bind:value={$formData.grade} name={props.name}>
									<Select.Trigger
										{...props}
										class="rounded-xl border-2 border-secondary-foreground bg-white text-lg font-medium !text-primary-foreground">
										{$formData.grade ? $formData.grade : 'Select your grade'}
									</Select.Trigger>
									<Select.Content>
										<Select.Item value="4" label="4" />
										<Select.Item value="5" label="5" />
										<Select.Item value="6" label="6" />
									</Select.Content>
								</Select.Root>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				</div>
				<div class="w-1/3 px-4">
					<Form.Field {form} name="transcript" class="mb-4 w-full">
						<Form.Control>
							{#snippet children({ props })}
								<div class="flex items-center gap-2">
									<Form.Label class="text-lg text-secondary-foreground">Transcript</Form.Label>
									{#if data.userHaveTranscript && data.user}
										<a
											href={`${base}/files/users/transcripts/${data.user.id}/Transcript.pdf`}
											target="_blank">
											<Download
												class="text-secondary-foreground transition-colors hover:text-primary-foreground" />
										</a>
									{/if}
								</div>
								<input
									{...props}
									bind:files={$file}
									type="file"
									accept="application/pdf"
									class="flex h-10 w-full cursor-pointer rounded-xl border-2 border-secondary-foreground bg-white px-3 py-1 !text-base font-medium text-primary-foreground ring-offset-background file:border-0 file:bg-transparent file:text-base file:font-medium file:text-secondary-foreground file:transition-colors placeholder:text-secondary-foreground file:hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm" />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				</div>
			</div>
		</div>
		<Form.Button
			class="button-gradient flex w-full items-center gap-2 rounded-xl text-lg text-white drop-shadow-lg">
			{#if $delayed}
				<LoaderCircle class="animate-spin" />
			{/if}
			Save
		</Form.Button>
	</form>
	<h1 class="mb-4 text-center text-4xl font-semibold">Security</h1>
	<form method="POST" action="?/change-password" use:changePasswordEnhance>
		<div class="mb-4 rounded-xl border-2 border-secondary-foreground p-4">
			<span class="mb-4 block text-xl font-semibold text-primary-foreground">Change password</span>
			<div class="flex">
				<div class="w-1/3 px-4">
					<Form.Field form={changePasswordForm} name="currentPassword" class="mb-4 w-full">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label class="text-lg text-secondary-foreground">Current password</Form.Label>
								<Input
									{...props}
									bind:value={$changePasswordFormData.currentPassword}
									type="password"
									class="rounded-xl border-2 border-secondary-foreground bg-white !text-lg font-medium text-primary-foreground placeholder:text-secondary-foreground" />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				</div>
				<div class="w-1/3 px-4">
					<Form.Field form={changePasswordForm} name="newPassword" class="mb-4 w-full">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label class="text-lg text-secondary-foreground">New password</Form.Label>
								<Input
									{...props}
									bind:value={$changePasswordFormData.newPassword}
									type="password"
									class="rounded-xl border-2 border-secondary-foreground bg-white !text-lg font-medium text-primary-foreground placeholder:text-secondary-foreground" />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				</div>
				<div class="w-1/3 px-4">
					<Form.Field form={changePasswordForm} name="confirmNewPassword" class="mb-4 w-full">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label class="text-lg text-secondary-foreground">
									Confirm new password
								</Form.Label>
								<Input
									{...props}
									bind:value={$changePasswordFormData.confirmNewPassword}
									type="password"
									class="rounded-xl border-2 border-secondary-foreground bg-white !text-lg font-medium text-primary-foreground placeholder:text-secondary-foreground" />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				</div>
			</div>
		</div>
		<Form.Button
			class="button-gradient flex w-full items-center gap-2 rounded-xl text-lg text-white drop-shadow-lg">
			{#if $changePasswordDelayed}
				<LoaderCircle class="animate-spin" />
			{/if}
			Change password
		</Form.Button>
	</form>
</div>
