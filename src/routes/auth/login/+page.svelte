<script lang="ts">
	import { LoaderCircle } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	import { base } from '$app/paths';

	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { configConstants } from '$lib/config-constants';
	import { getErrorMessage } from '$lib/error';

	import { formSchema } from './schema';

	import banner from '$lib/images/banner/banner-512.avif';
	import robots_phones from '$lib/images/robots-phones.avif';

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
</script>

<svelte:head>
	<title>CE Next Gen AI - Login</title>
</svelte:head>

<div class="mt-8 flex items-center">
	<form method="POST" use:enhance class="mx-16 ml-16 flex w-fit flex-grow flex-col items-center">
		<h1 class="mb-8 text-5xl font-semibold text-black">Welcome Back</h1>
		<h2 class="mb-8 text-5xl text-black">Glad to see you again!</h2>
		<div class="mb-8 w-96">
			<Form.Field {form} name="next">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label class="hidden">Next</Form.Label>
						<Input {...props} type="hidden" bind:value={$formData.next} readonly class="hidden" />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="email" class="mb-4 w-full">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label class="text-lg text-primary-foreground">Email</Form.Label>
						<Input
							{...props}
							type="email"
							bind:value={$formData.email}
							placeholder="username@email.com"
							class="rounded-xl border-2 border-secondary-foreground !text-lg placeholder:text-secondary-foreground" />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="password" class="w-full">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label class="text-lg text-primary-foreground">Password</Form.Label>
						<Input
							{...props}
							type="password"
							bind:value={$formData.password}
							placeholder="P@5sw0rd"
							class="rounded-xl border-2 border-secondary-foreground !text-lg placeholder:text-secondary-foreground" />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<a href="/auth/forgot-password" class="mb-4 block w-full text-primary-foreground">
				Forgot your password?
			</a>
			<Form.Button
				class="button-gradient flex w-full items-center gap-2 rounded-xl text-lg text-white drop-shadow-lg">
				{#if $delayed}
					<LoaderCircle class="animate-spin" />
				{/if}
				Login
			</Form.Button>
		</div>
		<span class="font-medium text-secondary-foreground">
			Don't have an account? <a
				href="{base}/auth/register"
				class="text-primary-foreground underline">
				Sign Up
			</a>
		</span>
	</form>
	<div class="-ml-8 flex w-64 max-w-3xl flex-shrink flex-grow-[999] flex-col items-center">
		<img src={banner} alt="Banner" width="512" height="133" class="-mr-[20%] mb-[5%] h-fit w-1/3" />
		<img
			src={robots_phones}
			alt="Robots using a phone decoration"
			width="1024"
			height="1058"
			class="-mt-[25%] h-fit w-full" />
	</div>
</div>
