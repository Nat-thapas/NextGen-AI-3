<script lang="ts">
	import { LogOut, User } from '@lucide/svelte';

	import { enhance } from '$app/forms';
	import { base } from '$app/paths';
	import { page } from '$app/state';

	import banner from '$lib/images/banner/banner-512.avif';

	let { data, children } = $props();

	let pathname = $derived(page.url.pathname);

	const navs: [string, string][] = [
		[`${base}/`, 'Home'],
		[`${base}/exercise`, 'Exercise'],
		[`${base}/challenge`, 'Challenge'],
		[`${base}/leaderboard`, 'Leaderboard']
	];
</script>

<nav class="mx-16 mt-4 flex h-16 items-center justify-between">
	<a href="{base}/" class="h-fit w-fit">
		<img src={banner} alt="Banner" class="h-fit w-48" />
	</a>
	{#if data.user !== undefined && navs.length > 0}
		<div class="flex items-center gap-8">
			{#each navs as nav (nav[0])}
				<a
					href={nav[0]}
					class:text-secondary-foreground={!pathname.startsWith(nav[0])}
					class:text-primary-foreground={pathname.startsWith(nav[0])}
					class="text-lg font-semibold transition-colors hover:text-primary-foreground">
					{nav[1]}
				</a>
			{/each}
		</div>
		<div class="flex w-48 items-center justify-end gap-4">
			<a href="{base}/profile/me">
				<User
					size={32}
					class="text-secondary-foreground transition-colors hover:text-primary-foreground" />
			</a>
			<form method="POST" use:enhance action={`${base}/auth/logout`} class="m-0 h-8 w-8 p-0">
				<button type="submit" class="m-0 h-8 w-8 p-0">
					<LogOut
						size={32}
						class="text-secondary-foreground transition-colors hover:text-primary-foreground" />
				</button>
			</form>
		</div>
	{:else}
		<div class="flex w-48 items-center justify-end gap-4">
			<a
				href="{base}/auth/login"
				class="font-semibold text-secondary-foreground transition-colors hover:text-primary-foreground">
				Login
			</a>
			<a
				href="{base}/auth/register"
				class="button-gradient rounded-full px-4 py-2 font-semibold text-white drop-shadow-md transition-colors">
				Register
			</a>
		</div>
	{/if}
</nav>

{@render children()}
