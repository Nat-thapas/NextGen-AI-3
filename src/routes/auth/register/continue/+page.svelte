<script lang="ts">
	import { LoaderCircle } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { getErrorMessage } from '$lib/utils';

	import { formSchema, type FormSchema } from './schema';

	import banner from '$lib/images/banner/banner-512.avif';
	import robots_phone from '$lib/images/robots-phone.avif';

	let { data }: { data: { form: SuperValidated<Infer<FormSchema>> } } = $props();

	let formWaiting: boolean = $state(false);

	const form = superForm(data.form, {
		validators: zodClient(formSchema),
		resetForm: false,
		onSubmit() {
			formWaiting = true;
		},
		onResult() {
			formWaiting = false;
		},
		onUpdated({ form }) {
			formWaiting = false;
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
			formWaiting = false;
			toast.error(getErrorMessage(result.error));
		}
	});

	const { form: formData, enhance } = form;
</script>

<div class="mt-8 flex items-center">
	<div class="-mr-8 flex w-64 max-w-3xl flex-shrink flex-grow-[999] flex-col items-center">
		<img src={banner} alt="Banner" class="-ml-[20%] mb-[5%] h-fit w-1/3" />
		<img src={robots_phone} alt="Robots using a phone decoration" class="-mt-[25%] h-fit w-full" />
	</div>
	<form method="POST" use:enhance class="mx-16 mr-16 flex w-fit flex-grow flex-col items-center">
		<h1 class="mb-8 text-5xl font-semibold text-black">Create Account</h1>
		<h2 class="mb-8 text-5xl text-black">to get started now!</h2>
		<div class="mb-8 w-96">
			<Form.Field {form} name="token">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label class="hidden">Token</Form.Label>
						<Input {...props} bind:value={$formData.token} readonly class="hidden" />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="password" class="mb-4 w-full">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label class="text-lg text-primary-foreground">Password</Form.Label>
						<Input
							{...props}
							type="password"
							bind:value={$formData.password}
							placeholder="P@5sw0rd"
							class="rounded-xl border-2 border-secondary-foreground text-xl placeholder:text-secondary-foreground" />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="confirmPassword" class="mb-4 w-full">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label class="text-lg text-primary-foreground">Confirm Password</Form.Label>
						<Input
							{...props}
							type="password"
							bind:value={$formData.confirmPassword}
							placeholder="P@5sw0rd"
							class="rounded-xl border-2 border-secondary-foreground text-xl placeholder:text-secondary-foreground" />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Button
				disabled={formWaiting}
				class="button-gradient flex w-full items-center gap-2 rounded-xl text-white drop-shadow-lg">
				{#if formWaiting}
					<LoaderCircle class="animate-spin" /> Loading...
				{:else}
					Next
				{/if}
			</Form.Button>
		</div>
	</form>
</div>
