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
	import robots_phone from '$lib/images/robots-phone.avif';

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
	<title>CE Next Gen AI - Reset Password</title>
</svelte:head>

<div class="mt-8 flex items-center">
	<div class="-mr-8 flex w-64 max-w-3xl flex-shrink flex-grow-[999] flex-col items-center">
		<a href={`${base}/`} class="z-10 -ml-[20%] mb-[5%] w-1/3">
			<img src={banner} alt="Banner" width="512" height="133" class="h-fit w-full" />
		</a>
		<img
			src={robots_phone}
			alt="Robots using a phone decoration"
			width="1024"
			height="1058"
			class="-mt-[25%] h-fit w-full" />
	</div>
	<form method="POST" use:enhance class="mx-16 mr-16 flex w-fit flex-grow flex-col items-center">
		<h1 class="mb-8 text-5xl font-semibold text-black">Reset Password</h1>
		<h2 class="mb-8 text-3xl text-black">Set a new password to use instead</h2>
		<div class="mb-8 w-96">
			<Form.Field {form} name="token">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label class="hidden">Token</Form.Label>
						<Input {...props} type="hidden" bind:value={$formData.token} readonly />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="password" class="mb-4 w-full">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label class="text-lg text-primary-foreground">New Password</Form.Label>
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
			<Form.Field {form} name="confirmPassword" class="mb-4 w-full">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label class="text-lg text-primary-foreground">Confirm New Password</Form.Label>
						<Input
							{...props}
							type="password"
							bind:value={$formData.confirmPassword}
							placeholder="P@5sw0rd"
							class="rounded-xl border-2 border-secondary-foreground !text-lg placeholder:text-secondary-foreground" />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Button
				class="button-gradient flex w-full items-center gap-2 rounded-xl text-lg text-white drop-shadow-lg">
				{#if $delayed}
					<LoaderCircle class="animate-spin" />
				{/if}
				Reset Password
			</Form.Button>
		</div>
	</form>
</div>
