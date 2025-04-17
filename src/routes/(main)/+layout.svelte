<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/state';

	import banner from '$lib/images/banner/banner-512.avif';

	let { data, children } = $props();

	const pathname = $derived(page.url.pathname);

	const navs: [string, string][] = [
		[`${base}/`, 'Home'],
		[`${base}/exercise`, 'Exercise'],
		[`${base}/challenge`, 'Challenge'],
		[`${base}/leaderboard`, 'Leaderboard']
	];
</script>

<nav class="mx-16 mt-4 flex h-16 items-center justify-between">
	<img src={banner} alt="Banner" class="h-fit w-48" />
	{#if data.user !== null && navs.length > 0}
		<div class="flex items-center gap-8">
			{#each navs as nav (nav[0])}
				<a
					href={nav[0]}
					class:text-secondary-foreground={!pathname.startsWith(nav[0])}
					class:text-primary-foreground={pathname.startsWith(nav[0])}
					class="font-semibold transition-colors hover:text-primary-foreground motion-reduce:transition-none">
					{nav[1]}
				</a>
			{/each}
		</div>
	{/if}
	<div class="flex w-48 items-center justify-end">
		<a
			href="{base}/auth/login"
			class="font-semibold text-secondary-foreground transition-colors hover:text-primary-foreground motion-reduce:transition-none">
			Login
		</a>
		<a
			href="{base}/auth/register"
			class="button-gradient ml-4 rounded-full px-4 py-2 font-semibold text-white drop-shadow-md transition-colors motion-reduce:transition-none">
			Register
		</a>
	</div>
</nav>

{@render children()}
