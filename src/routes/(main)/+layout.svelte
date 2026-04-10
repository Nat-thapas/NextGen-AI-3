<script lang="ts">
	import { BookOpen, FileCode, House, LogIn, LogOut, Menu, User } from '@lucide/svelte';
	import { onMount } from 'svelte';

	import { enhance } from '$app/forms';
	import { base } from '$app/paths';
	import { page } from '$app/state';

	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { roles } from '$lib/enums';
	import { isRoleAtLeast } from '$lib/roles';

	import banner from '$lib/images/banner/banner-512.avif';

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

<nav class="mx-4 mt-4 flex h-16 items-center justify-between gap-8 sm:mx-16">
	<a href="{base}/" class="h-fit w-fit flex-shrink-0">
		<img src={banner} width="512" height="133" alt="Banner" class="h-fit w-48" />
	</a>
	{#if data.user}
		<div class="hidden items-center gap-8 lg:flex">
			<a
				href={`${base}/`}
				class:text-secondary-foreground={pathname !== `${base}/`}
				class:text-primary-foreground={pathname === `${base}/`}
				class="text-lg font-semibold transition-colors hover:text-primary-foreground">
				Home
			</a>
			{#if isRoleAtLeast(data.user.role, roles.student)}
				{#each navs as nav (nav[0])}
					<a
						href={nav[0]}
						class:text-secondary-foreground={!pathname.startsWith(nav[0])}
						class:text-primary-foreground={pathname.startsWith(nav[0])}
						class="text-lg font-semibold transition-colors hover:text-primary-foreground">
						{nav[1]}
					</a>
				{/each}
			{/if}
			{#if isRoleAtLeast(data.user.role, roles.staff)}
				<a
					href={`${base}/markdown-preview`}
					class:text-secondary-foreground={!pathname.startsWith(`${base}/markdown-preview`)}
					class:text-primary-foreground={pathname.startsWith(`${base}/markdown-preview`)}
					class="text-lg font-semibold transition-colors hover:text-primary-foreground">
					Markdown
				</a>
			{/if}
		</div>
		<div class="hidden w-48 items-center justify-end gap-4 lg:flex">
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
		<div class="hidden w-48 items-center justify-end gap-4 lg:flex">
			<a
				href="{base}/auth/oauth/google?next={page.url.searchParams.get('next') ?? `${base}/`}"
				class="button-gradient rounded-full px-4 py-2 font-semibold text-white drop-shadow-md transition-colors">
				Register / Login
			</a>
		</div>
	{/if}
	<DropdownMenu.Root>
		<DropdownMenu.Trigger class="block text-secondary-foreground lg:hidden">
			<Menu size={32} />
		</DropdownMenu.Trigger>
		<DropdownMenu.Content class="w-64 p-2">
			{#if data.user}
				<DropdownMenu.Group class="mb-4 space-y-2">
					<DropdownMenu.GroupHeading class="text-lg font-semibold text-accent">
						Pages
					</DropdownMenu.GroupHeading>
					<DropdownMenu.Separator />
					<DropdownMenu.Item class="p-0 hover:bg-secondary">
						<a
							href={`${base}/`}
							class="flex h-full w-full items-center gap-2 p-2 text-base font-semibold text-primary-foreground transition-colors">
							<House class="!size-6" />
							Home
						</a>
					</DropdownMenu.Item>
					{#if isRoleAtLeast(data.user.role, roles.student)}
						{#each navs as nav (nav[0])}
							{@const Icon = nav[2]}
							<DropdownMenu.Item class="p-0 hover:bg-secondary">
								<a
									href={nav[0]}
									class="flex w-full items-center gap-2 p-2 text-base font-semibold text-primary-foreground transition-colors">
									<Icon class="!size-6" />
									{nav[1]}
								</a>
							</DropdownMenu.Item>
						{/each}
					{/if}
					{#if isRoleAtLeast(data.user.role, roles.staff)}
						<DropdownMenu.Item class="p-0 hover:bg-secondary">
							<a
								href={`${base}/markdown-preview`}
								class="flex w-full items-center gap-2 p-2 text-base font-semibold text-primary-foreground transition-colors">
								<FileCode class="!size-6" />
								Markdown
							</a>
						</DropdownMenu.Item>
					{/if}
				</DropdownMenu.Group>
				<DropdownMenu.Group class="space-y-2">
					<DropdownMenu.GroupHeading class="text-lg font-semibold text-accent">
						User
					</DropdownMenu.GroupHeading>
					<DropdownMenu.Separator />
					<DropdownMenu.Item class="p-0 hover:bg-secondary">
						<a
							href="{base}/profile/me"
							class="flex w-full items-center gap-2 p-2 text-base font-semibold text-primary-foreground transition-colors">
							<User class="!size-6" />
							Profile
						</a>
					</DropdownMenu.Item>
					<DropdownMenu.Item class="p-0 hover:bg-secondary">
						<form method="POST" use:enhance action={`${base}/auth/logout`}>
							<button
								type="submit"
								class="flex w-full items-center gap-2 p-2 text-base font-semibold text-primary-foreground transition-colors">
								<LogOut class="!size-6" />
								Log out
							</button>
						</form>
					</DropdownMenu.Item>
				</DropdownMenu.Group>
			{:else}
				<DropdownMenu.Group class="space-y-2">
					<DropdownMenu.GroupHeading class="text-lg font-semibold text-accent">
						User
					</DropdownMenu.GroupHeading>
					<DropdownMenu.Separator />
					<DropdownMenu.Item class="p-0 hover:bg-secondary">
						<a
							href="{base}/auth/oauth/google?next={page.url.searchParams.get('next') ?? `${base}/`}"
							class="flex w-full items-center gap-2 p-2 text-base font-semibold text-primary-foreground transition-colors">
							<LogIn />
							Register / Login
						</a>
					</DropdownMenu.Item>
				</DropdownMenu.Group>
			{/if}
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</nav>

{@render children()}
