<script lang="ts">
	import { page } from '$app/state';
</script>

<div style="height: calc(100dvh - 2rem);" class="flex w-full items-center justify-center">
	<div class="flex min-h-16 items-stretch justify-center gap-4">
		<span class="flex items-center text-5xl text-primary-foreground">{page.status}</span>
		<div class="w-0.5 rounded-full bg-primary-foreground"></div>
		<span class="flex max-w-32 items-center text-xl text-primary-foreground">
			{page.error?.message}
		</span>
	</div>
</div>
