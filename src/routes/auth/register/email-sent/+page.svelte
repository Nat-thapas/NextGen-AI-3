<script lang="ts">
	import { base } from '$app/paths';

	import banner from '$lib/images/banner/banner-512.png';
	import email from '$lib/images/email.avif';
	import robots_phone from '$lib/images/robots-phone.avif';
</script>

<svelte:head>
	<title>CE Next Gen AI - Email sent</title>
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
	<div class="mx-16 mr-16 flex w-fit flex-grow flex-col items-center">
		<div class="mb-4 flex items-center gap-4">
			<img src={email} alt="Email icon" width="129" height="129" class="h-20 w-20" />
			<h1 class="text-5xl font-semibold text-black">Check Your Mailbox!</h1>
		</div>
		<span class="mb-8 max-w-xl text-lg leading-relaxed text-black">
			We've sent you an email with the verification link, please click the link to verify your
			email. If you do not see an email, please check the spam folder.
		</span>
	</div>
</div>
