<script lang="ts">
	import banner from '$lib/images/banner/banner-512.avif';
	import email from '$lib/images/email.avif';
	import robots_phone from '$lib/images/robots-phone.avif';
</script>

<svelte:head>
	<title>CE Next Gen AI - Email sent</title>
</svelte:head>

<div class="mt-8 flex items-center">
	<div class="-mr-8 flex w-64 max-w-3xl flex-shrink flex-grow-[999] flex-col items-center">
		<img src={banner} alt="Banner" class="-ml-[20%] mb-[5%] h-fit w-1/3" />
		<img src={robots_phone} alt="Robots using a phone decoration" class="-mt-[25%] h-fit w-full" />
	</div>
	<div class="mx-16 mr-16 flex w-fit flex-grow flex-col items-center">
		<div class="mb-4 flex items-center gap-4">
			<img src={email} alt="Email icon" class="h-20 w-20" />
			<h1 class="text-5xl font-semibold text-black">Check Your Mailbox!</h1>
		</div>
		<span class="mb-8 max-w-xl text-lg leading-relaxed text-black">
			We've sent you an email with the verification link, please click the link to verify your
			email. If you do not see an email, please check the spam folder.
		</span>
	</div>
</div>
