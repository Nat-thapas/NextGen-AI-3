<script lang="ts">
	import { Download, LoaderCircle } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { fileProxy, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	import { base } from '$app/paths';

	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import * as Select from '$lib/components/ui/select';
	import { configConstants } from '$lib/config-constants';
	import { getErrorMessage } from '$lib/error';

	import { updateProfileFormSchema } from './schema';

	let { data } = $props();

	const updateProfileForm = superForm(data.updateProfileForm, {
		validators: zodClient(updateProfileFormSchema),
		resetForm: false,
		delayMs: configConstants.forms.delay,
		timeoutMs: configConstants.forms.timeout,
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
		form: updateProfileFormData,
		enhance: updateProfileEnhance,
		delayed: updateProfileDelayed
	} = updateProfileForm;

	let file = fileProxy(updateProfileForm, 'transcript');
</script>

<svelte:head>
	<title>CE Next Gen AI - My Profile</title>
</svelte:head>

<div class="flex w-full justify-center">
	<div
		class="m-4 w-0 max-w-6xl grow rounded-2xl bg-white p-4 drop-shadow-xl sm:m-8 sm:px-16 sm:py-8">
		<h1 class="text-gradient mb-4 text-center text-4xl font-semibold">Profile</h1>
		<form
			method="POST"
			action="?/update-profile"
			enctype="multipart/form-data"
			use:updateProfileEnhance>
			<div class="mb-4 rounded-xl border-2 border-sidebar-border p-4">
				<span class="mb-4 block text-xl font-semibold text-primary-foreground">
					Personal Information
				</span>
				<div class="flex flex-wrap">
					<div class="w-64 px-2 sm:px-4">
						<Form.Field form={updateProfileForm} name="prefix" class="mb-4 w-full">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label class="text-lg text-secondary-foreground">Prefix</Form.Label>
									<Select.Root
										type="single"
										bind:value={$updateProfileFormData.prefix}
										name={props.name}>
										<Select.Trigger
											{...props}
											class="rounded-xl border-2 border-sidebar-border bg-white text-lg font-medium !text-primary-foreground">
											{$updateProfileFormData.prefix
												? $updateProfileFormData.prefix
												: 'Select your prefix'}
										</Select.Trigger>
										<Select.Content>
											<Select.Item value="นาย" label="นาย" />
											<Select.Item value="นางสาว" label="นางสาว" />
										</Select.Content>
									</Select.Root>
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
					</div>
					<div class="w-96 grow px-2 sm:px-4">
						<Form.Field form={updateProfileForm} name="name" class="mb-4 w-full">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label class="text-lg text-secondary-foreground">Name</Form.Label>
									<Input
										{...props}
										bind:value={$updateProfileFormData.name}
										placeholder="สมชาย บุญรอด"
										class="rounded-xl border-2 border-sidebar-border bg-white !text-lg font-medium text-primary-foreground placeholder:text-secondary-foreground" />
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
					</div>
				</div>
				<div class="flex flex-wrap">
					<div class="w-64 grow px-2 sm:px-4">
						<Form.Field form={updateProfileForm} name="nickname" class="mb-4 w-full">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label class="text-lg text-secondary-foreground">Nickname</Form.Label>
									<Input
										{...props}
										bind:value={$updateProfileFormData.nickname}
										placeholder="เขียว"
										class="rounded-xl border-2 border-sidebar-border bg-white !text-lg font-medium text-primary-foreground placeholder:text-secondary-foreground" />
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
					</div>
					<div class="w-64 grow px-2 sm:px-4">
						<Form.Field form={updateProfileForm} name="phoneNumber" class="mb-4 w-full">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label class="text-lg text-secondary-foreground">Phone number</Form.Label>
									<Input
										{...props}
										bind:value={$updateProfileFormData.phoneNumber}
										placeholder="0987654321"
										class="rounded-xl border-2 border-sidebar-border bg-white !text-lg font-medium text-primary-foreground placeholder:text-secondary-foreground" />
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
					</div>
					<div class="w-64 grow px-2 sm:px-4">
						<span class="mb-2 block text-lg text-secondary-foreground">Email</span>
						<input
							value={data.user?.email}
							readonly
							class="h-10 w-full rounded-xl border-2 border-sidebar-border bg-white px-3 !text-lg font-medium text-primary-foreground placeholder:text-secondary-foreground" />
					</div>
				</div>
			</div>
			<div class="mb-4 rounded-xl border-2 border-sidebar-border p-4">
				<span class="mb-4 block text-xl font-semibold text-primary-foreground">Address</span>
				<div class="flex flex-wrap">
					<div class="w-96 grow px-2 sm:px-4">
						<Form.Field form={updateProfileForm} name="addressDetail" class="mb-4 w-full">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label class="text-lg text-secondary-foreground">Detail</Form.Label>
									<Input
										{...props}
										bind:value={$updateProfileFormData.addressDetail}
										placeholder="39/743 ซอยหัวหิน 102"
										class="rounded-xl border-2 border-sidebar-border bg-white !text-lg font-medium text-primary-foreground placeholder:text-secondary-foreground" />
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
					</div>
					<div class="w-48 grow px-2 sm:px-4">
						<Form.Field form={updateProfileForm} name="addressSubDistrict" class="mb-4 w-full">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label class="text-lg text-secondary-foreground">Sub-district</Form.Label>
									<Input
										{...props}
										bind:value={$updateProfileFormData.addressSubDistrict}
										placeholder="หนองแก"
										class="rounded-xl border-2 border-sidebar-border bg-white !text-lg font-medium text-primary-foreground placeholder:text-secondary-foreground" />
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
					</div>
				</div>
				<div class="flex flex-wrap">
					<div class="w-48 grow px-2 sm:px-4">
						<Form.Field form={updateProfileForm} name="addressDistrict" class="mb-4 w-full">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label class="text-lg text-secondary-foreground">District</Form.Label>
									<Input
										{...props}
										bind:value={$updateProfileFormData.addressDistrict}
										placeholder="หัวหิน"
										class="rounded-xl border-2 border-sidebar-border bg-white !text-lg font-medium text-primary-foreground placeholder:text-secondary-foreground" />
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
					</div>
					<div class="w-48 grow px-2 sm:px-4">
						<Form.Field form={updateProfileForm} name="addressProvince" class="mb-4 w-full">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label class="text-lg text-secondary-foreground">Province</Form.Label>
									<Input
										{...props}
										bind:value={$updateProfileFormData.addressProvince}
										placeholder="ประจวบคีรีขันธ์"
										class="rounded-xl border-2 border-sidebar-border bg-white !text-lg font-medium text-primary-foreground placeholder:text-secondary-foreground" />
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
					</div>
					<div class="w-48 grow px-2 sm:px-4">
						<Form.Field form={updateProfileForm} name="addressPostcode" class="mb-4 w-full">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label class="text-lg text-secondary-foreground">Postcode</Form.Label>
									<Input
										{...props}
										bind:value={$updateProfileFormData.addressPostcode}
										placeholder="77110"
										class="rounded-xl border-2 border-sidebar-border bg-white !text-lg font-medium text-primary-foreground placeholder:text-secondary-foreground" />
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
					</div>
				</div>
			</div>
			<div class="mb-4 rounded-xl border-2 border-sidebar-border p-4">
				<span class="mb-4 block text-xl font-semibold text-primary-foreground">Education</span>
				<div class="flex flex-wrap">
					<div class="w-64 grow px-2 sm:px-4">
						<Form.Field form={updateProfileForm} name="schoolName" class="mb-4 w-full">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label class="text-lg text-secondary-foreground">School</Form.Label>
									<Input
										{...props}
										bind:value={$updateProfileFormData.schoolName}
										placeholder="ลาดกระบังวิทยา"
										class="rounded-xl border-2 border-sidebar-border bg-white !text-lg font-medium text-primary-foreground placeholder:text-secondary-foreground" />
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
					</div>
					<div class="w-64 grow px-2 sm:px-4">
						<Form.Field form={updateProfileForm} name="grade" class="mb-4 w-full">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label class="text-lg text-secondary-foreground">Education</Form.Label>
									<Select.Root
										type="single"
										bind:value={$updateProfileFormData.grade}
										name={props.name}>
										<Select.Trigger
											{...props}
											class="rounded-xl border-2 border-sidebar-border bg-white text-lg font-medium !text-primary-foreground">
											{$updateProfileFormData.grade
												? $updateProfileFormData.grade
												: 'Select your education'}
										</Select.Trigger>
										<Select.Content>
											<Select.Item value="ม.6" label="ม.6" />
											<Select.Item value="ปวช." label="ปวช." />
										</Select.Content>
									</Select.Root>
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
					</div>
					<div class="w-72 grow px-2 sm:px-4">
						<Form.Field form={updateProfileForm} name="transcript" class="mb-4 w-full">
							<Form.Control>
								{#snippet children({ props })}
									<div class="flex items-center justify-between gap-4">
										<Form.Label class="text-lg text-secondary-foreground">Transcript</Form.Label>
										{#if data.transcript}
											<a
												href={`${base}/api/files/${data.transcript.id}/transcript${data.transcript.extension}`}
												target="_blank"
												class="flex items-center gap-2 text-secondary-foreground hover:text-primary-foreground">
												<span>View uploaded file</span>
												<Download class="transition-colors" />
											</a>
										{/if}
									</div>
									<input
										{...props}
										bind:files={$file}
										type="file"
										accept="application/pdf"
										class="flex h-10 w-full cursor-pointer rounded-xl border-2 border-sidebar-border bg-white px-2 py-1.5 !text-base font-medium text-primary-foreground ring-offset-background file:border-0 file:bg-transparent file:text-base file:font-medium file:text-secondary-foreground file:transition-colors placeholder:text-secondary-foreground file:hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm" />
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
					</div>
				</div>
			</div>
			<Form.Button
				class="button-gradient flex w-full items-center gap-2 rounded-xl text-lg text-white drop-shadow-lg">
				{#if $updateProfileDelayed}
					<LoaderCircle class="animate-spin" />
				{/if}
				Save
			</Form.Button>
		</form>
	</div>
</div>
