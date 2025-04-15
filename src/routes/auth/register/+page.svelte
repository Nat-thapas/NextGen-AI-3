<script lang="ts">
	import { LoaderCircle } from '@lucide/svelte';
	import { type SvelteComponent } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	import { base } from '$app/paths';

	import { Button } from '$lib/components/ui/button';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';

	import { formSchema, type FormSchema } from './schema';

	import banner from '$lib/images/banner/banner-512.avif';
	import robots_phone from '$lib/images/robots-phone.avif';

	let { data }: { data: { form: SuperValidated<Infer<FormSchema>> } } = $props();

	const form = superForm(data.form, {
		validators: zodClient(formSchema),
		resetForm: false,
		onSubmit() {
			formProcessing = true;
		},
		onResult() {
			formProcessing = false;
		},
		onUpdate() {
			formProcessing = false;
		},
		onError() {
			formProcessing = false;
		}
	});

	// TODO: Add on message to display form message

	const { form: formData, enhance } = form;

	let formProcessing: boolean = $state(false);
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
			<Form.Field {form} name="email" class="mb-4 w-full">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label class="text-lg text-primary-foreground">Email</Form.Label>
						<Input
							{...props}
							bind:value={$formData.email}
							placeholder="username@email.com"
							class="rounded-xl border-2 border-secondary-foreground text-xl placeholder:text-secondary-foreground" />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			{#if formProcessing}
				<Button
					disabled
					class="button-gradient flex w-full items-center gap-2 rounded-xl text-white drop-shadow-lg">
					<LoaderCircle class="animate-spin" /> Processing...
				</Button>
			{:else}
				<Form.Button class="button-gradient w-full rounded-xl text-white drop-shadow-lg">
					Next
				</Form.Button>
			{/if}
		</div>
		<span class="font-medium text-secondary-foreground">
			Already have an account? <a
				href="{base}/auth/login"
				class="text-primary-foreground underline">
				Login
			</a>
		</span>
	</form>
</div>
