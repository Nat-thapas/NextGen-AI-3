<script lang="ts">
	import { base } from '$app/paths';

	import banner from '$lib/images/banner/banner-512.avif';

	let { children } = $props();
</script>

<nav class="mx-16 mt-4 flex h-16 items-center justify-between">
	<img src={banner} alt="Banner" class="h-fit w-48" />
	<div>
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
