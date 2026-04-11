<script lang="ts">
	import { BookOpen, FileCode, House, LogIn, LogOut, Menu, User } from '@lucide/svelte';
	import { onMount } from 'svelte';

	import { enhance } from '$app/forms';
	import { base } from '$app/paths';
	import { page } from '$app/state';

	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { roles } from '$lib/enums';
	import { isRoleAtLeast } from '$lib/roles';

	import banner from '$lib/images/banner/banner-512.png';

	let { data, children } = $props();

	let pathname = $derived(page.url.pathname);

	const navs: [string, string, typeof BookOpen][] = [
		// [`${base}/exercises`, 'Exercises', BookOpen],
		// [`${base}/challenges`, 'Challenges', Target],
		// [`${base}/leaderboards`, 'Leaderboards', Trophy]
	];

	onMount(() => {
		document.cookie = `time-zone=${Intl.DateTimeFormat().resolvedOptions().timeZone}; Secure; Path=/; SameSite=Lax; Priority=Medium; max-age=31536000`;
	});
</script>

{@render children()}
