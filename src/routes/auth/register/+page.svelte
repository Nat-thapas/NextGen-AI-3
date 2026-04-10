<script lang="ts">
	import { LoaderCircle } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { fileProxy, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import * as Select from '$lib/components/ui/select';
	import { configConstants } from '$lib/config-constants';
	import { getErrorMessage } from '$lib/error';

	import { formSchema } from './schema';

	let { data } = $props();

	const form = superForm(data.form, {
		validators: zodClient(formSchema),
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

	const { form: formData, enhance, delayed } = form;

	let file = fileProxy(form, 'transcript');
</script>

<svelte:head>
	<title>CE Next Gen AI - Register</title>
</svelte:head>

<div class="mx-auto mt-8 max-w-6xl rounded-2xl bg-white p-8 px-16 drop-shadow-xl">
	<h1 class="mb-4 text-center text-4xl font-semibold">Profile</h1>
	<form method="POST" enctype="multipart/form-data" use:enhance>
		<Form.Field {form} name="next">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label class="hidden">Next</Form.Label>
					<Input {...props} type="hidden" bind:value={$formData.next} />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
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
					<Form.Field {form} name="email" class="mb-4 w-full">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label class="text-lg text-secondary-foreground">Email</Form.Label>
								<Input
									{...props}
									type="email"
									bind:value={$formData.email}
									readonly
									class="rounded-xl border-2 border-secondary-foreground bg-white !text-lg font-medium text-primary-foreground placeholder:text-secondary-foreground" />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
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
								</div>
								<input
									{...props}
									bind:files={$file}
									type="file"
									accept="application/pdf"
									class="flex h-10 w-full cursor-pointer rounded-xl border-2 border-secondary-foreground bg-white px-2 py-1.5 !text-base font-medium text-primary-foreground ring-offset-background file:border-0 file:bg-transparent file:text-base file:font-medium file:text-secondary-foreground file:transition-colors placeholder:text-secondary-foreground file:hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm" />
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
</div>
