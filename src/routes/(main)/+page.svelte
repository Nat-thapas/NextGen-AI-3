<script lang="ts">
	import { ChevronRight, Facebook, Instagram, LoaderCircle, Pin, Plus } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { fileProxy, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	import { base } from '$app/paths';
	import { page } from '$app/state';

	import * as Dialog from '$lib/components/ui/dialog';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { configConstants } from '$lib/config-constants';
	import { formatDate, formatDateTime } from '$lib/datetime';
	import { roles } from '$lib/enums';
	import { getErrorMessage } from '$lib/error';
	import { isRoleAtLeast } from '$lib/roles';
	import { setSearchParams } from '$lib/url';

	import { createAnnouncementFormSchema } from './schema';

	import robot_wand from '$lib/images/aura.png';
	import bell from '$lib/images/bell.avif';
	import binder from '$lib/images/binder.avif';
	import robots from '$lib/images/hero2.png';
	import hero3 from '$lib/images/hero3.png';
	import hero4 from '$lib/images/hero4.png';
	import hero5 from '$lib/images/hero5.png';
	import hero6 from '$lib/images/hero6.png';
	import robot_love_thing from '$lib/images/qualify.png';
	import robot_trophy from '$lib/images/robot-trophy.avif';
	import robots_mobile from '$lib/images/robots-mobile.avif';

	let { data } = $props();

	const agendas: [number, Date, Date | null, string][] = [
		[0, new Date(2026, 3, 13), new Date(2026, 3, 27), 'เปิดรับสมัคร (Registeration)'],
		[1, new Date(2026, 4, 4), new Date(2026, 4, 24), 'ปูพื้นฐาน (Foundation)'],
		[2, new Date(2026, 4, 31), null, 'สอบวัดพื้นฐาน (Onsite Assessment)'],
		[3, new Date(2026, 5, 8), new Date(2026, 6, 19), 'พัฒนาความรู้เชิงลึก (Advanced Learning)'],
		[
			4,
			new Date(2026, 6, 25),
			new Date(2026, 6, 26),
			'ฝึกปฏิบัติแบบทีม (Team-based Onsite Workshop)'
		],
		[
			5,
			new Date(2026, 8, 4),
			new Date(2026, 8, 7),
			'การแข่งขัน Hackathon (Final Individual Hackathon)'
		]
	];

	const heroImages = [robots, hero3, hero4, hero5, hero6];
	let currentImageIndex = $state(0);
	$effect(() => {
		const interval = setInterval(() => {
			currentImageIndex = (currentImageIndex + 1) % heroImages.length;
		}, 3500);

		return () => clearInterval(interval);
	});

	const requirements: string[] = [
		'นักเรียนที่กำลังศึกษาอยู่ในชั้นมัธยมศึกษาปีที่ 6 หรือ ปวช. 3 ปีการศึกษา 2569',
		'นักเรียนที่มีความสนใจและชื่นชอบในเทคโนโลยีคอมพิวเตอร์ และปัญญาประดิษฐ์',
		'นักเรียนที่มีความพร้อมในการเรียนรู้และพัฒนาทักษะทาง ด้าน AI และเทคโนโลยีใหม่ๆ',
		'นักเรียนที่สามารถเข้าร่วมกิจกรรมต่างๆ ตามกำหนดการ ที่ทางค่ายได้แจ้งไว้'
	];

	let moreAnnouncementsLink = $derived(
		setSearchParams(page.url, { 'announcements-count': data.announcements.length + 5 }).toString()
	);

	let isCreateAnnouncementFormDialogOpen = $state(false);

	const createAnnouncementForm = superForm(data.createAnnouncementForm, {
		validators: zodClient(createAnnouncementFormSchema),
		resetForm: false,
		delayMs: configConstants.forms.delay,
		timeoutMs: configConstants.forms.longTimeout,
		onUpdated({ form }) {
			if (form.message) {
				switch (form.message.type) {
					case 'success':
						toast.success(form.message.text);
						isCreateAnnouncementFormDialogOpen = false;
						createAnnouncementForm.reset();
						break;
					case 'info':
						toast.info(form.message.text);
						isCreateAnnouncementFormDialogOpen = false;
						createAnnouncementForm.reset();
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

	const {
		form: createAnnouncementFormData,
		enhance: createAnnouncementEnhance,
		delayed: createAnnouncementDelayed
	} = createAnnouncementForm;

	let announcementFile = fileProxy(createAnnouncementForm, 'file');
</script>

<svelte:head>
	<title>Next Gen AI - Home</title>
</svelte:head>

<div
	class="mb-8 mt-8 flex flex-col-reverse justify-between gap-4 md:mb-24 md:flex-row md:items-center">
	<div class="relative w-full md:ml-16 md:w-[55%] lg:w-[50%] xl:w-[45%]">
		<h1 class="title-gradient mb-4 px-8 text-4xl font-bold !leading-tight md:px-0 md:text-5xl">
			NEXTGEN AI CAMP
			<br />
		</h1>
		<h2 class="font-Medium mb-4 px-8 text-3xl text-secondary-foreground md:px-0">
			From Fundamental to Frontier
		</h2>
		<p class="mb-8 px-8 text-xl leading-relaxed text-primary-foreground md:px-0 md:text-lg">
			กิจกรรมค่ายปัญญาประดิษฐ์ที่เปิดโอกาสให้คุณได้เรียนรู้ สร้างสรรค์ และก้าวสู่ความเป็นผู้นำด้าน
			AI ในอนาคต พบกับประสบการณ์ที่มากกว่าการเรียน ด้วยเวิร์กชอป มากมาย และการแข่งขันที่ท้าทาย
			เพื่อค้นหาศักยภาพ ในตัวคุณ ไม่ว่าคุณจะเริ่มต้นเส้นทางสาย AI หรืออยาก พัฒนาทักษะให้เฉียบคมขึ้น
			นี่คือจุดเริ่มต้นสำหรับคุณ
		</p>
		{#if data.user === undefined}
			<a
				href="{base}/auth/register"
				class="button-gradient mx-8 rounded-full px-6 py-2 text-xl font-semibold text-white drop-shadow-md transition-colors md:mx-0">
				สมัครเข้าร่วมค่าย
			</a>
		{/if}
	</div>

	<div
		class="relative mb-8 w-full px-8 md:mb-0 md:mr-16 md:block md:w-[45%] md:px-0 lg:w-[40%] xl:w-[35%]">
		<div class="aspect-square w-full overflow-hidden rounded-xl bg-transparent drop-shadow-md">
			<div
				class="flex h-full w-full transition-transform duration-700 ease-in-out"
				style="transform: translateX(-{currentImageIndex * 100}%);">
				{#each heroImages as img, i}
					<img
						src={img}
						alt="NextGen AI Camp Highlight {i + 1}"
						class="h-full w-full flex-shrink-0 object-cover" />
				{/each}
			</div>
		</div>

		<div class="absolute -bottom-6 left-0 right-0 flex justify-center gap-2 md:-bottom-8">
			{#each heroImages as _, i}
				<button
					class="h-2.5 w-2.5 rounded-full transition-all duration-300 {currentImageIndex === i
						? 'w-6 bg-[#006FE8]'
						: 'bg-gray-300 hover:bg-gray-400'}"
					onclick={() => (currentImageIndex = i)}
					aria-label="Go to slide {i + 1}">
				</button>
			{/each}
		</div>
	</div>
</div>

<div class="mx-4 mb-16 md:mx-0 md:mb-32">
	<div class="relative hidden flex-col items-center justify-center md:flex">
		<h2 class="text-gradient mb-8 py-2 text-4xl font-semibold">สิ่งที่น้องๆ จะได้รับ</h2>
		<!-- <div class="absolute -right-20 bottom-20 -z-10 h-[600px] w-[600px] rounded-full bg-[#3395FF]/15 blur-[150px]"></div> -->
	</div>

	<h2 class="text-gradient relative mb-4 text-center text-3xl font-semibold md:hidden">
		สิ่งที่น้องๆ จะได้รับ
	</h2>
	<!-- <div class="absolute  bottom-20 -z-10 h-[600px] w-[600px] rounded-full bg-[#3395FF]/15 blur-[150px]"></div> -->

	<div class="relative mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2 lg:gap-10">
		<div
			class="flex w-full flex-col items-center justify-center rounded-xl bg-white p-8 drop-shadow-lg transition-transform hover:scale-[1.02]">
			<h3 class="mb-4 text-xl font-bold text-accent md:text-3xl">10 อันดับแรก</h3>
			<p class="text-center leading-relaxed text-primary-foreground md:text-xl">
				รับโควต้าเข้าเรียนวิศวะคอม สจล. <br />
				รอบ Portfolio TCAS 70
			</p>
		</div>

		<div
			class="flex w-full flex-col items-center justify-center rounded-xl bg-white p-8 drop-shadow-lg transition-transform hover:scale-[1.02]">
			<h3 class="mb-4 text-xl font-bold text-accent md:text-3xl">50 อันดับแรก</h3>
			<p class="text-center leading-relaxed text-primary-foreground md:text-xl">
				ได้รับประกาศนียบัตรรับรอง <br />
				การเข้าร่วมโครงการ
			</p>
		</div>

		<div
			class="flex w-full flex-col items-center justify-center rounded-xl bg-white p-8 drop-shadow-lg transition-transform hover:scale-[1.02]">
			<h3 class="mb-4 text-xl font-bold text-accent md:text-3xl">Zero to Hero</h3>
			<p class="text-center leading-relaxed text-primary-foreground md:text-xl">
				ปูพื้นฐานตั้งแต่เริ่มต้น <br />
				ไปจนถึงการเทรนโมเดลจริง
			</p>
		</div>

		<div
			class="flex w-full flex-col items-center justify-center rounded-xl bg-white p-8 drop-shadow-lg transition-transform hover:scale-[1.02]">
			<h3 class="mb-4 text-xl font-bold text-accent md:text-3xl">Community</h3>
			<p class="text-center leading-relaxed text-primary-foreground md:text-xl">
				ได้รู้จักเพื่อนใหม่ที่มีความสนใจเดียวกัน และพี่ ๆ ที่พร้อมให้คำแนะนำ
			</p>
		</div>
	</div>
</div>

<div class="relative mx-4 mb-16 md:mx-0 md:mb-32">
	<div class="relative hidden flex-col items-center justify-center md:flex">
		<h2 class="text-gradient mb-8 py-2 text-4xl font-semibold">กำหนดการ</h2>
		<!-- <div class="absolute -right-20 bottom-20 -z-10 h-[600px] w-[600px] rounded-full bg-[#3395FF]/15 blur-[150px]"></div> -->
	</div>

	<h2 class="text-gradient relative mb-4 text-center text-3xl font-semibold md:hidden">กำหนดการ</h2>
	<!-- <div class="absolute  bottom-20 -z-10 h-[600px] w-[600px] rounded-full bg-[#3395FF]/15 blur-[150px]"></div> -->

	<div class="md:mx-16">
		<div
			class="relative mx-auto w-auto max-w-7xl rounded-xl bg-white px-8 pb-4 pt-12 drop-shadow-lg">
			<img
				src={binder}
				width="256"
				height="143"
				alt="Binder decoration"
				class="absolute -top-4 left-16 h-8 w-fit md:-top-8 md:h-16" />
			<img
				src={binder}
				width="256"
				height="143"
				alt="Binder decoration"
				class="absolute -top-4 right-16 h-8 w-fit md:-top-8 md:h-16" />
			{#each agendas as agenda (agenda[0])}
				<div class="mb-4 flex flex-col md:mb-2 md:flex-row md:items-start">
					<div
						class="mb-1 flex flex-wrap items-center text-primary-foreground md:mb-0 md:flex-nowrap">
						<span class="block w-auto font-medium md:w-28 md:text-lg md:font-normal">
							{formatDate(agenda[1], { timeZone: 'UTC' })}
						</span>

						{#if agenda[2] !== null}
							<span class="mx-2 block w-auto text-center md:w-4 md:text-lg">-</span>
							<span class="block w-auto font-medium md:mr-16 md:w-28 md:text-lg md:font-normal">
								{formatDate(agenda[2], { timeZone: 'UTC' })}
							</span>
						{:else}
							<span class="hidden md:mr-16 md:block md:w-36"></span>
						{/if}
					</div>

					<span
						class="block w-full flex-grow break-words leading-relaxed text-accent md:w-0 md:text-lg">
						{agenda[3]}
					</span>
				</div>
			{/each}
		</div>
	</div>
</div>

<div class="mx-4 mb-16 md:mx-8 md:mb-32">
	<h2 class="text-gradient mb-8 py-2 text-center text-3xl font-semibold md:mb-8 md:text-4xl">
		คุณสมบัติผู้สมัคร
	</h2>

	<div
		class="relative mx-auto flex w-full max-w-7xl flex-col items-center justify-center gap-10 md:flex-row md:items-stretch lg:gap-24 xl:gap-[100px]">
		<div class="flex w-full justify-center md:w-1/2 md:justify-end">
			<img
				src={robot_love_thing}
				width="1024"
				height="1049"
				alt="Applicant Requirements"
				class="h-auto w-full max-w-md rounded-2xl object-cover drop-shadow-xl lg:max-w-lg" />
		</div>
		<!-- <div class="absolute -right-20 bottom-20 -z-10 h-[600px] w-[600px] rounded-full bg-[#3395FF]/20 blur-[150px]"></div> -->
		{#snippet requirementIcon(index: number)}
			<div class="flex-shrink-0">
				{#if index === 0}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="40"
						height="40"
						viewBox="0 0 48 48"
						fill="none">
						<path
							d="M38 42V38C38 35.8783 37.1571 33.8434 35.6569 32.3431C34.1566 30.8429 32.1217 30 30 30H18C15.8783 30 13.8434 30.8429 12.3431 32.3431C10.8429 33.8434 10 35.8783 10 38V42M32 14C32 18.4183 28.4183 22 24 22C19.5817 22 16 18.4183 16 14C16 9.58172 19.5817 6 24 6C28.4183 6 32 9.58172 32 14Z"
							stroke="#006FE8"
							stroke-width="4"
							stroke-linecap="round"
							stroke-linejoin="round" />
					</svg>
				{:else if index === 1}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="40"
						height="40"
						viewBox="0 0 48 48"
						fill="none">
						<path
							d="M40.1085 31.974H7.89253M36.0005 10C37.0614 10 38.0788 10.4214 38.829 11.1716C39.5791 11.9217 40.0005 12.9391 40.0005 14V31.052C40.0003 31.6749 40.1454 32.2892 40.4245 32.846L42.5605 37.1C42.7147 37.406 42.7877 37.7464 42.7725 38.0887C42.7573 38.431 42.6545 38.7637 42.4738 39.0548C42.2931 39.3459 42.0406 39.5857 41.7406 39.7512C41.4406 39.9167 41.1031 40.0024 40.7605 40H7.24053C6.89791 40.0024 6.56042 39.9167 6.26042 39.7512C5.96042 39.5857 5.70797 39.3459 5.52728 39.0548C5.34659 38.7637 5.24372 38.431 5.22853 38.0887C5.21334 37.7464 5.28634 37.406 5.44053 37.1L7.57653 32.846C7.85561 32.2892 8.0008 31.6749 8.00053 31.052V14C8.00053 12.9391 8.42196 11.9217 9.1721 11.1716C9.92225 10.4214 10.9397 10 12.0005 10H36.0005Z"
							stroke="#006FE8"
							stroke-width="4"
							stroke-linecap="round"
							stroke-linejoin="round" />
					</svg>
				{:else if index === 2}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="40"
						height="40"
						viewBox="0 0 48 48"
						fill="none">
						<path
							d="M23.9997 36V10M23.9997 36C24.0008 37.0935 24.2261 38.1752 24.6617 39.1782C25.0973 40.1812 25.7339 41.0842 26.5321 41.8315C27.3304 42.5789 28.2734 43.1546 29.3029 43.5232C30.3324 43.8919 31.4265 44.0455 32.5177 43.9747C33.6089 43.9039 34.674 43.6101 35.6472 43.1115C36.6204 42.613 37.4811 41.9202 38.1761 41.0759C38.8711 40.2317 39.3856 39.2539 39.6879 38.2031C39.9902 37.1522 40.0738 36.0505 39.9336 34.966M23.9997 36C23.9985 37.0935 23.7732 38.1752 23.3376 39.1782C22.902 40.1812 22.2654 41.0842 21.4672 41.8315C20.6689 42.5789 19.7259 43.1546 18.6964 43.5232C17.6669 43.8919 16.5728 44.0455 15.4816 43.9747C14.3904 43.9039 13.3253 43.6101 12.3521 43.1115C11.3789 42.613 10.5182 41.9202 9.82322 41.0759C9.12824 40.2317 8.61372 39.2539 8.31142 38.2031C8.00913 37.1522 7.92548 36.0505 8.06565 34.966M23.9997 10C23.9996 9.07967 24.2113 8.17165 24.6183 7.3462C25.0254 6.52075 25.6168 5.8 26.347 5.23971C27.0771 4.67942 27.9264 4.29461 28.8291 4.11505C29.7317 3.9355 30.6636 3.966 31.5526 4.20421C32.4416 4.44241 33.2638 4.88194 33.9558 5.48878C34.6477 6.09562 35.1908 6.8535 35.543 7.70381C35.8952 8.55411 36.047 9.47403 35.9868 10.3924C35.9266 11.3108 35.6559 12.203 35.1957 13M23.9997 10C23.9997 9.07967 23.788 8.17165 23.381 7.3462C22.9739 6.52075 22.3825 5.8 21.6523 5.23971C20.9222 4.67942 20.0729 4.29461 19.1702 4.11505C18.2676 3.9355 17.3357 3.966 16.4467 4.20421C15.5577 4.44241 14.7355 4.88194 14.0435 5.48878C13.3516 6.09562 12.8085 6.8535 12.4563 7.70381C12.1041 8.55411 11.9523 9.47403 12.0125 10.3924C12.0727 11.3108 12.3434 12.203 12.8037 13M29.9997 26C28.2692 25.4942 26.7493 24.4413 25.6677 22.999C24.586 21.5568 24.0007 19.8028 23.9997 18C23.9986 19.8028 23.4133 21.5568 22.3317 22.999C21.25 24.4413 19.7301 25.4942 17.9997 26M35.9937 10.25C37.1692 10.5523 38.2606 11.1181 39.1852 11.9046C40.1097 12.6912 40.8432 13.6778 41.33 14.7897C41.8168 15.9017 42.0441 17.1098 41.9949 18.3226C41.9456 19.5355 41.621 20.7212 41.0457 21.79M35.9997 36C37.7607 35.9999 39.4724 35.4188 40.8695 34.3468C42.2666 33.2747 43.2709 31.7716 43.7267 30.0706C44.1825 28.3696 44.0643 26.5657 43.3904 24.9388C42.7166 23.3118 41.5247 21.9526 39.9996 21.072M11.9997 36C10.2386 35.9999 8.52686 35.4188 7.12978 34.3468C5.7327 33.2747 4.72839 31.7716 4.2726 30.0706C3.81681 28.3696 3.93502 26.5657 4.60888 24.9388C5.28275 23.3118 6.47462 21.9526 7.99965 21.072M12.0057 10.25C10.8301 10.5523 9.73865 11.1181 8.81411 11.9046C7.88957 12.6912 7.15613 13.6778 6.66934 14.7897C6.18255 15.9017 5.95517 17.1098 6.00443 18.3226C6.05369 19.5355 6.37829 20.7212 6.95365 21.79"
							stroke="#006FE8"
							stroke-width="4"
							stroke-linecap="round"
							stroke-linejoin="round" />
					</svg>
				{:else}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="40"
						height="40"
						viewBox="0 0 48 48"
						fill="none">
						<path
							d="M16 4V12M32 4V12M6 20H42M18 32L22 36L30 28M10 8H38C40.2091 8 42 9.79086 42 12V40C42 42.2091 40.2091 44 38 44H10C7.79086 44 6 42.2091 6 40V12C6 9.79086 7.79086 8 10 8Z"
							stroke="#006FE8"
							stroke-width="4"
							stroke-linecap="round"
							stroke-linejoin="round" />
					</svg>
				{/if}
			</div>
		{/snippet}

		<div class="flex w-full flex-col justify-center space-y-8 md:w-1/2">
			{#each requirements as requirement, i (requirement)}
				<div class="flex items-start gap-4 md:items-center">
					{@render requirementIcon(i)}
					<span class="text-lg leading-relaxed text-primary-foreground md:text-xl">
						{requirement}
					</span>
				</div>
			{/each}
		</div>
	</div>
</div>

<div class="mx-4 mb-12 md:mx-0 md:mb-24">
	<div class="mb-8 flex w-full justify-center md:mb-12">
		<div class="flex items-center justify-center gap-4">
			{#if isRoleAtLeast(data.user?.role, roles.teacher)}
				<Dialog.Root bind:open={isCreateAnnouncementFormDialogOpen}>
					<Dialog.Trigger
						class="flex h-12 w-12 items-center justify-center rounded-full bg-secondary-foreground text-white drop-shadow-md transition-colors hover:bg-primary-foreground">
						<Plus size={28} />
					</Dialog.Trigger>
					<Dialog.Content>
						<Dialog.Header>
							<Dialog.Title class="text-lg">Create announcement</Dialog.Title>
							<Dialog.Description class="text-base text-primary-foreground">
								Upload a .zip file containing the announcement data in markdown format and your
								assets. For more instruction please visit
								<a class="underline" href="/instructions/upload-contents">how to upload contents</a>
							</Dialog.Description>
						</Dialog.Header>
						<form
							method="POST"
							action="?/create-announcement"
							enctype="multipart/form-data"
							use:createAnnouncementEnhance>
							<Form.Field form={createAnnouncementForm} name="title" class="mb-4 w-full">
								<Form.Control>
									{#snippet children({ props })}
										<Form.Label class="text-lg text-primary-foreground">Title</Form.Label>
										<Input
											{...props}
											bind:value={$createAnnouncementFormData.title}
											class="rounded-xl border-2 border-secondary-foreground bg-white !text-lg font-medium text-primary-foreground placeholder:text-secondary-foreground" />
									{/snippet}
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>
							<Form.Field form={createAnnouncementForm} name="file" class="mb-4 w-full">
								<Form.Control>
									{#snippet children({ props })}
										<div class="flex items-center gap-2">
											<Form.Label class="text-lg text-primary-foreground">Upload file</Form.Label>
										</div>
										<input
											{...props}
											bind:files={$announcementFile}
											type="file"
											accept="application/zip, application/zip-compressed, application/x-zip-compressed, multipart/x-zip"
											class="flex h-10 w-full cursor-pointer rounded-xl border-2 border-secondary-foreground bg-white px-2 py-1.5 !text-base font-medium text-primary-foreground ring-offset-background file:border-0 file:bg-transparent file:text-base file:font-medium file:text-secondary-foreground file:transition-colors placeholder:text-secondary-foreground file:hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm" />
									{/snippet}
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>
							<Form.Button
								class="button-gradient flex w-full items-center gap-2 rounded-xl text-lg text-white drop-shadow-lg">
								{#if $createAnnouncementDelayed}
									<LoaderCircle class="animate-spin" />
								{/if}
								Create
							</Form.Button>
						</form>
					</Dialog.Content>
				</Dialog.Root>
			{/if}

			<div class="relative hidden flex-col items-center justify-center md:flex">
				<h2 class="text-gradient mb-8 py-2 text-4xl font-semibold">ประกาศ</h2>
				<!-- <div class="absolute -right-20 bottom-20 -z-10 h-[600px] w-[600px] rounded-full bg-[#3395FF]/15 blur-[150px]"></div> -->
			</div>

			<h2 class="text-gradient relative mb-4 text-center text-3xl font-semibold md:hidden">
				ประกาศ
			</h2>
			<!-- <div class="absolute  bottom-20 -z-10 h-[600px] w-[600px] rounded-full bg-[#3395FF]/15 blur-[150px]"></div> -->
		</div>
	</div>

	<div class="space-y-4 md:mx-16">
		{#each data.announcements as announcement (announcement.id)}
			<a
				href={`${base}/announcements/${announcement.id}`}
				class="box-shadow: 4px 4px 30px 0 rgba(131, 190, 255, 0.60); mx-auto flex max-w-7xl items-center gap-4 rounded-xl bg-white p-4 drop-shadow-lg transition-transform hover:scale-[1.01]">
				<img src={bell} width="128" height="128" alt="Bell" class="h-12 w-12" />
				<div class="w-0 flex-grow overflow-hidden">
					<span
						class="block overflow-hidden text-ellipsis text-nowrap font-semibold text-primary-foreground md:text-lg">
						{announcement.title}
					</span>
					<span class="text-sm text-secondary-foreground md:text-base">
						{formatDateTime(announcement.createdAt, {
							timeZone: data.timeZone
						})}
					</span>
				</div>
				<ChevronRight size={32} class="text-secondary-foreground" />
			</a>
		{:else}
			<span class="block text-center text-lg text-secondary-foreground md:text-xl">
				ไม่มีประกาศ
			</span>
		{/each}

		{#if data.moreAnnouncementsAvailable}
			<a
				href={moreAnnouncementsLink}
				data-sveltekit-replacestate
				data-sveltekit-noscroll
				class="mx-auto !mt-8 block text-center text-lg text-primary-foreground underline transition-colors hover:text-secondary-foreground">
				ดูเพิ่มเติม
			</a>
		{/if}
	</div>
</div>

<footer class="mt-auto w-full pt-8 md:pt-[24px]">
	<div class="mx-auto flex w-full max-w-[1728px] flex-col items-start gap-[16px] px-4 md:px-[96px]">
		<h2 class="text-md font-bold text-black md:text-sm">
			ภาควิชาวิศวกรรมคอมพิวเตอร์ คณะวิศวกรรมศาสตร์ สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง
		</h2>

		<div class=" grid w-full grid-cols-1 gap-4 md:grid-cols-2 md:gap-16">
			<div class="flex flex-col gap-4">
				<a
					href="https://www.facebook.com/profile.php?id=61559737934327"
					class="flex items-center justify-start gap-4">
					<div class="flex flex-shrink-0 items-center justify-center rounded-full text-white">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 48 48"
							fill="none">
							<path
								d="M48 24.0602C48 10.7789 37.248 0 24 0C10.752 0 0 10.7789 0 24.0602C0 35.7053 8.256 45.4015 19.2 47.6391V31.2782H14.4V24.0602H19.2V18.0451C19.2 13.4015 22.968 9.62406 27.6 9.62406H33.6V16.8421H28.8C27.48 16.8421 26.4 17.9248 26.4 19.2481V24.0602H33.6V31.2782H26.4V48C38.52 46.797 48 36.5474 48 24.0602Z"
								fill="url(#paint0_linear_1313_18105)" />
							<defs>
								<linearGradient
									id="paint0_linear_1313_18105"
									x1="-0.000747503"
									y1="47.9997"
									x2="47.9994"
									y2="-0.000584423"
									gradientUnits="userSpaceOnUse">
									<stop stop-color="#00438C" />
									<stop offset="1" stop-color="#006FFB" />
								</linearGradient>
							</defs>
						</svg>
					</div>
					<span class="text-sm text-primary-foreground">NextGen AI</span>
				</a>

				<a
					href="https://www.instagram.com/nextgen.ai.camp/"
					class="flex items-center justify-start gap-4">
					<div class="flex flex-shrink-0 items-center justify-center rounded-full text-white">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 48 48"
							fill="none">
							<path
								d="M26.4679 0C29.1679 0.00719983 30.5382 0.0215995 31.7214 0.0551987L32.187 0.0719982C32.7246 0.0911977 33.255 0.115197 33.8957 0.143996C36.4493 0.263993 38.1916 0.667184 39.7204 1.25997C41.3044 1.86955 42.6387 2.69513 43.9731 4.0271C45.1939 5.22643 46.1383 6.67777 46.7402 8.2798C47.333 9.80856 47.7362 11.5509 47.8562 14.1069C47.885 14.7452 47.909 15.2756 47.9282 15.8156L47.9426 16.2812C47.9786 17.462 47.993 18.8323 47.9978 21.5323L48.0002 23.3226V26.4666C48.006 28.2171 47.9876 29.9676 47.945 31.7176L47.9306 32.1832C47.9114 32.7232 47.8874 33.2536 47.8586 33.892C47.7386 36.4479 47.3306 38.1879 46.7402 39.719C46.1383 41.3211 45.1939 42.7724 43.9731 43.9717C42.7738 45.1926 41.3224 46.1369 39.7204 46.7389C38.1916 47.3317 36.4493 47.7348 33.8957 47.8548L32.187 47.9268L31.7214 47.9412C30.5382 47.9748 29.1679 47.9916 26.4679 47.9964L24.6776 47.9988H21.536C19.7847 48.005 18.0334 47.9866 16.2826 47.9436L15.817 47.9292C15.2473 47.9077 14.6777 47.8829 14.1082 47.8548C11.5547 47.7348 9.81233 47.3317 8.28116 46.7389C6.68 46.1366 5.2295 45.1923 4.03087 43.9717C2.80917 42.7726 1.86398 41.3213 1.26133 39.719C0.668549 38.1903 0.265359 36.4479 0.145361 33.892L0.0733633 32.1832L0.0613639 31.7176C0.0171234 29.9676 -0.00287824 28.2171 0.00136508 26.4666V21.5323C-0.00527771 19.7818 0.0123237 18.0312 0.054164 16.2812L0.0709635 15.8156C0.090163 15.2756 0.114162 14.7452 0.142962 14.1069C0.262959 11.5509 0.666149 9.81096 1.25893 8.2798C1.86299 6.67711 2.80983 5.22572 4.03327 4.0271C5.23121 2.80685 6.68085 1.86253 8.28116 1.25997C9.81233 0.667184 11.5523 0.263993 14.1082 0.143996C14.7466 0.115197 15.2794 0.0911977 15.817 0.0719982L16.2826 0.0575984C18.0326 0.0149581 19.7831 -0.00344319 21.5336 0.00239977L26.4679 0ZM24.0008 11.9997C20.8183 11.9997 17.7661 13.264 15.5157 15.5143C13.2653 17.7647 12.0011 20.8169 12.0011 23.9994C12.0011 27.1819 13.2653 30.2341 15.5157 32.4845C17.7661 34.7349 20.8183 35.9991 24.0008 35.9991C27.1833 35.9991 30.2355 34.7349 32.4859 32.4845C34.7362 30.2341 36.0005 27.1819 36.0005 23.9994C36.0005 20.8169 34.7362 17.7647 32.4859 15.5143C30.2355 13.264 27.1833 11.9997 24.0008 11.9997ZM24.0008 16.7996C24.9463 16.7994 25.8825 16.9855 26.7561 17.3472C27.6297 17.7089 28.4235 18.2391 29.0922 18.9075C29.7609 19.576 30.2913 20.3696 30.6533 21.2431C31.0153 22.1165 31.2017 23.0527 31.2018 23.9982C31.202 24.9437 31.0159 25.88 30.6542 26.7536C30.2925 27.6271 29.7623 28.4209 29.0939 29.0896C28.4254 29.7583 27.6318 30.2888 26.7583 30.6507C25.8849 31.0127 24.9487 31.1991 24.0032 31.1992C22.0937 31.1992 20.2624 30.4407 18.9121 29.0905C17.5619 27.7402 16.8034 25.9089 16.8034 23.9994C16.8034 22.0899 17.5619 20.2586 18.9121 18.9084C20.2624 17.5581 22.0937 16.7996 24.0032 16.7996M36.6029 8.3998C35.8072 8.3998 35.0442 8.71586 34.4816 9.27845C33.919 9.84105 33.603 10.6041 33.603 11.3997C33.603 12.1954 33.919 12.9584 34.4816 13.521C35.0442 14.0836 35.8072 14.3997 36.6029 14.3997C37.3985 14.3997 38.1616 14.0836 38.7241 13.521C39.2867 12.9584 39.6028 12.1954 39.6028 11.3997C39.6028 10.6041 39.2867 9.84105 38.7241 9.27845C38.1616 8.71586 37.3985 8.3998 36.6029 8.3998Z"
								fill="url(#paint0_linear_1313_18112)" />
							<defs>
								<linearGradient
									id="paint0_linear_1313_18112"
									x1="-0.000747523"
									y1="47.9997"
									x2="47.9994"
									y2="-0.00184326"
									gradientUnits="userSpaceOnUse">
									<stop stop-color="#00438C" />
									<stop offset="1" stop-color="#006FFB" />
								</linearGradient>
							</defs>
						</svg>
					</div>
					<span class="text-sm text-primary-foreground">nextgen.ai.camp</span>
				</a>
			</div>

			<a
				href="https://maps.app.goo.gl/5MFUS5E8khvjwVFP6"
				class="flex items-start justify-start gap-4">
				<svg
					class="mt-1 flex-shrink-0"
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 48 48"
					fill="none">
					<path
						d="M28.2043 5.32777C29.4603 4.49577 31.5883 3.90177 33.1943 5.50777L42.4883 14.8038C44.1003 16.4118 43.5043 18.5398 42.6703 19.7938C42.2188 20.4737 41.631 21.0526 40.9443 21.4938C40.2763 21.9198 39.4323 22.2418 38.5223 22.1938C38.0821 22.1626 37.6431 22.1152 37.2063 22.0518L37.0703 22.0318C36.6011 21.9645 36.1294 21.9158 35.6563 21.8858C34.6483 21.8358 34.2603 22.0058 34.1363 22.1258L29.1563 27.1078C28.9963 27.2678 28.7963 27.6238 28.6443 28.3078C28.4983 28.9678 28.4343 29.7798 28.4183 30.6798C28.4043 31.5438 28.4343 32.4278 28.4663 33.2798L28.4683 33.3738C28.4983 34.2198 28.5283 35.0838 28.4863 35.7618C28.3563 37.8238 26.7503 39.3418 25.1703 40.0438C23.5903 40.7438 21.3363 40.9178 19.7703 39.3498L15.2703 34.8498L7.06031 43.0598C6.92298 43.2071 6.75738 43.3253 6.57338 43.4073C6.38938 43.4893 6.19076 43.5334 5.98935 43.5369C5.78795 43.5405 5.58789 43.5035 5.40111 43.428C5.21434 43.3526 5.04467 43.2403 4.90223 43.0978C4.75979 42.9554 4.6475 42.7857 4.57206 42.599C4.49662 42.4122 4.45957 42.2121 4.46312 42.0107C4.46668 41.8093 4.51076 41.6107 4.59275 41.4267C4.67473 41.2427 4.79293 41.0771 4.94031 40.9398L13.1483 32.7298L8.64831 28.2298C7.08231 26.6618 7.25431 24.4098 7.95631 22.8298C8.65631 21.2498 10.1763 19.6438 12.2363 19.5138C12.9163 19.4718 13.7803 19.5018 14.6263 19.5318L14.7203 19.5338C15.5723 19.5638 16.4563 19.5958 17.3203 19.5818C18.2203 19.5658 19.0323 19.5018 19.6923 19.3558C20.3763 19.2038 20.7323 19.0018 20.8923 18.8418L25.8723 13.8618C25.9943 13.7398 26.1643 13.3498 26.1123 12.3418C26.0823 11.8687 26.0336 11.397 25.9663 10.9278L25.9483 10.7918C25.8849 10.355 25.8375 9.91603 25.8063 9.47577C25.7563 8.56577 26.0783 7.72177 26.5023 7.05377C26.9343 6.37377 27.5323 5.77377 28.2043 5.32777Z"
						fill="url(#paint0_linear_1313_18108)" />
					<defs>
						<linearGradient
							id="paint0_linear_1313_18108"
							x1="4.46228"
							y1="43.5369"
							x2="43.5025"
							y2="4.49661"
							gradientUnits="userSpaceOnUse">
							<stop stop-color="#00438C" />
							<stop offset="1" stop-color="#006FFB" />
						</linearGradient>
					</defs>
				</svg>

				<span class="text-sm leading-relaxed text-primary-foreground">
					อาคารปฏิบัติการรวมวิศวกรรมศาสตร์ 2 (ECC) เลขที่ 1 ซอยฉลองกรุง 1 <br />
					แขวงลาดกระบัง เขตลาดกระบัง กรุงเทพมหานคร 10520
				</span>
			</a>
		</div>
	</div>
</footer>
