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
	import { getErrorMessage } from '$lib/error';
	import { setSearchParams } from '$lib/fetch-json';
	import { isRoleAtLeast } from '$lib/roles';

	import { createAnnouncementFormSchema } from './schema';

	import robots from '$lib/images/3-robots.avif';
	import badge_10 from '$lib/images/badge-10.avif';
	import badge_50 from '$lib/images/badge-50.avif';
	import bell from '$lib/images/bell.avif';
	import binder from '$lib/images/binder.avif';
	import ce from '$lib/images/ce.avif';
	import check_icon from '$lib/images/check-icon.avif';
	import kmitl from '$lib/images/kmitl.avif';
	import robot_announce from '$lib/images/robot-announce.avif';
	import robot_checklist from '$lib/images/robot-checklist.avif';
	import robot_love_thing from '$lib/images/robot-love-things.avif';
	import robot_trophy from '$lib/images/robot-trophy.avif';
	import robot_wand from '$lib/images/robot-wand.avif';

	let { data } = $props();

	const agendas: [number, Date, Date | null, string][] = [
		[0, new Date(2025, 3, 4), new Date(2025, 3, 15), 'ลงทะเบียน'],
		[1, new Date(2025, 3, 19), new Date(2025, 3, 20), 'สอบคัดเลือก'],
		[2, new Date(2025, 3, 25), null, 'ประกาศผลสอบคัดเลือก 300 คน'],
		[3, new Date(2025, 3, 26), null, 'ผู้ผ่านการคัดเลือกเข้า Discord, GitHub'],
		[4, new Date(2025, 3, 30), null, 'พิธีเปิดค่าย']
	];

	const requirements: string[] = [
		'นักเรียนที่กำลังศึกษาอยู่ในชั้นมัธยมศึกษาปีที่ 4-6 สายสามัญ หรือเทียบเท่า',
		'นักเรียนที่มีความสนใจและชื่นชอบในเทคโนโลยีคอมพิวเตอร์ และปัญญาประดิษฐ์',
		'นักเรียนที่มีความพร้อมในการเรียนรู้และพัฒนาทักษะทาง ด้าน AI และเทคโนโลยีใหม่ๆ',
		'นักเรียนที่สามารถเข้าร่วมกิจกรรมต่างๆ ตามกำหนดการ ที่ทางค่ายได้แจ้งไว้'
	];

	let moreAnnouncementsLink = $derived(
		setSearchParams(page.url, { 'announcements-count': data.announcements.length + 5 }).toString()
	);

	let isFormDialogOpen = $state(false);

	const createAnnouncementForm = superForm(data.createAnnouncementForm, {
		validators: zodClient(createAnnouncementFormSchema),
		resetForm: false,
		delayMs: configConstants.forms.delay,
		timeoutMs: configConstants.forms.longTimeout,
		multipleSubmits: 'prevent',
		onUpdated({ form }) {
			if (form.message) {
				switch (form.message.type) {
					case 'success':
						toast.success(form.message.text);
						isFormDialogOpen = false;
						break;
					case 'info':
						toast.info(form.message.text);
						isFormDialogOpen = false;
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

	let file = fileProxy(createAnnouncementForm, 'file');
</script>

<svelte:head>
	<title>CE Next Gen AI - Home</title>
</svelte:head>

<div class="mb-32 mt-16 flex items-center">
	<div class="ml-16 w-0 flex-grow-[4] xl:flex-grow-[5] 2xl:flex-grow-[6]">
		<h1 class="mb-4 text-5xl font-semibold !leading-tight">
			Welcome to
			<br />
			<span class="title-gradient">CE NEXT GEN AI CAMP</span>
			<br />
			The starting point for
			<wbr />
			world changers with AI.
		</h1>
		<p class="mb-8 text-xl leading-relaxed text-primary-foreground">
			กิจกรรมค่ายปัญญาประดิษฐ์ที่เปิดโอกาสให้คุณได้เรียนรู้ สร้างสรรค์ และก้าวสู่ความเป็นผู้นำด้าน
			AI ในอนาคต พบกับประสบการณ์ที่มากกว่าการเรียน ด้วยเวิร์กชอป มากมาย และการแข่งขันที่ท้าทาย
			เพื่อค้นหาศักยภาพ ในตัวคุณ ไม่ว่าคุณจะเริ่มต้นเส้นทางสาย AI หรืออยาก พัฒนาทักษะให้เฉียบคมขึ้น
			นี่คือจุดเริ่มต้นสำหรับคุณ
		</p>
		{#if data.user === undefined}
			<a
				href="{base}/auth/register"
				class="button-gradient rounded-full px-6 py-2 text-xl font-semibold text-white drop-shadow-md transition-colors">
				Join Us
			</a>
		{/if}
	</div>
	<img
		src={robots}
		width="1024"
		height="1202"
		alt="Robots"
		class="-z-10 -mb-80 -ml-16 -mt-40 h-fit w-0 flex-grow-[4]" />
</div>

<div class="mb-32">
	<div class="flex justify-between">
		<div class="w-48 flex-shrink"></div>
		<div class="flex w-0 flex-grow flex-col items-center">
			<h2 class="mb-4 text-4xl font-semibold">Special Benefits</h2>
			<p class="max-w-xl text-center text-xl leading-relaxed text-primary-foreground">
				เพราะทุกความสำเร็จ ไม่ว่าจะเล็กหรือใหญ่ สมควรได้รับการยอมรับ
				เพื่อเป็นแรงบันดาลใจให้คุณก้าวไปสู่ความสำเร็จที่ยิ่งใหญ่กว่าเดิม
			</p>
		</div>
		<img
			src={robot_trophy}
			width="256"
			height="403"
			alt="Robot holding a trophy decoration"
			class="-mt-16 h-fit w-48" />
	</div>
	<div class="mx-16 -mt-8 flex flex-col items-center">
		<div class="mt-8 flex w-full justify-evenly gap-4">
			<div class="flex w-96 flex-col items-center rounded-xl bg-white p-4 drop-shadow-lg">
				<img
					src={badge_10}
					width="256"
					height="365"
					alt="Badge 10"
					class="absolute -top-20 h-fit w-48 drop-shadow-lg" />
				<h3 class="text-gradient mb-4 mt-52 text-4xl font-bold">10 อันดับแรก</h3>
				<p class="text-center text-xl leading-relaxed text-primary-foreground">
					รับโควตาพิเศษ TCAS69 รอบ Portfolio ก้าวเข้าสู่มหาวิทยาลัยในฝันของคุณได้ทันที!
				</p>
			</div>
			<div class="flex w-96 flex-col items-center rounded-xl bg-white p-4 drop-shadow-lg">
				<img
					src={badge_50}
					width="256"
					height="365"
					alt="Badge 50"
					class="absolute -top-20 h-fit w-48 drop-shadow-lg" />
				<h3 class="text-gradient mb-4 mt-52 text-4xl font-bold">50 อันดับแรก</h3>
				<p class="text-center text-xl leading-relaxed text-primary-foreground">
					รับเกียรติบัตรอย่างเป็นทางการ เพิ่มความโดดเด่นให้ Portfolio ของคุณ!
				</p>
			</div>
		</div>
	</div>
</div>

<div class="mb-32">
	<div class="flex justify-between">
		<img
			src={robot_wand}
			width="256"
			height="384"
			alt="Robot holding a wand decoration"
			class="z-10 -mt-16 h-fit w-56" />
		<div class="flex w-0 flex-grow flex-col items-center">
			<h2 class="mb-4 text-4xl font-semibold">Agenda</h2>
			<p class="mb-8 text-center text-xl leading-relaxed text-primary-foreground">
				ติดตามทุกช่วงเวลาสำคัญ เพื่อก้าวสู่ความสำเร็จในค่าย CE Next Gen AI
			</p>
		</div>
		<div class="w-64 flex-shrink"></div>
	</div>
	<div class="mx-16 -mt-32">
		<div
			class="relative mx-auto w-auto max-w-7xl space-y-2 rounded-xl bg-white px-8 pb-8 pt-12 drop-shadow-lg">
			<img
				src={binder}
				width="256"
				height="143"
				alt="Binder decoration"
				class="absolute -top-8 left-16 h-16 w-fit" />
			<img
				src={binder}
				width="256"
				height="143"
				alt="Binder decoration"
				class="absolute -top-8 right-16 h-16 w-fit" />
			{#each agendas as agenda (agenda[0])}
				<div class="flex">
					<span class="block w-28 text-lg text-primary-foreground">{formatDate(agenda[1])}</span>
					{#if agenda[2] !== null}
						<span class="mx-2 block w-4 text-center text-lg text-primary-foreground">-</span>
						<span class="mr-16 block w-28 text-lg text-primary-foreground">
							{formatDate(agenda[2])}
						</span>
					{:else}
						<span class="mr-16 w-36"></span>
					{/if}
					<span
						class="block w-0 flex-grow overflow-hidden text-ellipsis text-nowrap text-lg text-primary-foreground">
						{agenda[3]}
					</span>
				</div>
			{/each}
		</div>
	</div>
</div>

<div class="mb-32">
	<div class="flex justify-between">
		<div class="w-64 flex-shrink"></div>
		<div class="flex w-0 flex-grow flex-col items-center">
			<h2 class="mb-4 text-4xl font-semibold">Requirements</h2>
			<p class="mb-8 text-center text-xl leading-relaxed text-primary-foreground">
				เปิดโอกาสให้ผู้ที่สนใจด้านเทคโนโลยีและ AI ได้เรียนรู้และพัฒนาทักษะไปด้วยกัน
			</p>
		</div>
		<img
			src={robot_checklist}
			width="256"
			height="396"
			alt="Robot holding a checklist decoration"
			class="-mt-16 h-fit w-56" />
	</div>
	<div class="mx-auto -mt-48 flex max-w-screen-2xl items-center pr-16">
		<img
			src={robot_love_thing}
			width="1024"
			height="1049"
			alt="Robots"
			class="-z-10 h-fit w-0 flex-grow" />
		<div class="ml-16 w-0 flex-grow space-y-4 xl:mx-32 2xl:flex-grow-[2]">
			{#each requirements as requirement (requirement)}
				<div class="flex items-center gap-2">
					<img src={check_icon} width="64" height="64" alt="Checkmark" class="h-8 w-8" />
					<span class="text-lg text-primary-foreground">{requirement}</span>
				</div>
			{/each}
		</div>
	</div>
</div>

<div class="mb-24">
	<div class="flex justify-between">
		<img
			src={robot_announce}
			width="256"
			height="326"
			alt="Robot announcing decoration"
			class="-mt-16 h-fit w-56" />
		<div class="flex w-0 flex-grow flex-col items-center">
			<div class="mb-4 flex items-center justify-center gap-4">
				{#if isRoleAtLeast(data.user?.role, 'teacher')}
					<Dialog.Root bind:open={isFormDialogOpen}>
						<Dialog.Trigger
							class="flex h-12 w-12 items-center justify-center rounded-full bg-secondary-foreground text-white transition-colors hover:bg-primary-foreground">
							<Plus />
						</Dialog.Trigger>
						<Dialog.Content>
							<Dialog.Header>
								<Dialog.Title class="text-lg">Create announcement</Dialog.Title>
								<Dialog.Description class="text-base text-primary-foreground">
									Upload a .zip file containing the announcement data in markdown format and your
									assets. For more instruction please visit
									<a class="underline" href="/instructions/upload-contents">
										how to upload contents
									</a>
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
												bind:files={$file}
												type="file"
												accept="application/zip, application/zip-compressed, application/x-zip-compressed, multipart/x-zip"
												class="flex h-10 w-full cursor-pointer rounded-xl border-2 border-secondary-foreground bg-white px-3 py-1 !text-base font-medium text-primary-foreground ring-offset-background file:border-0 file:bg-transparent file:text-base file:font-medium file:text-secondary-foreground file:transition-colors placeholder:text-secondary-foreground file:hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm" />
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
				<h2 class="text-4xl font-semibold">Announcements</h2>
			</div>
			<p class="max-w-xl text-center text-xl leading-relaxed text-primary-foreground">
				ติดตามข่าวสารและประกาศสำคัญเกี่ยวกับโครงการ CE Next Gen AI
				เพื่อไม่พลาดโอกาสสำคัญในการพัฒนาทักษะและเข้าร่วมกิจกรรมต่างๆ
			</p>
		</div>
		<div class="w-64 flex-shrink"></div>
	</div>
	<div class="mx-16 -mt-16 space-y-4">
		{#each data.announcements as announcement (announcement.id)}
			<a
				href={`${base}/announcements/${announcement.id}`}
				class="mx-auto flex max-w-7xl items-center gap-4 rounded-xl bg-white p-4 drop-shadow-lg">
				<img src={bell} width="128" height="128" alt="Bell" class="h-12 w-12" />
				<div class="w-0 flex-grow overflow-hidden">
					<span
						class="block overflow-hidden text-ellipsis text-nowrap text-lg font-semibold text-primary-foreground">
						{announcement.title}
					</span>
					<span class="text-secondary-foreground">
						{formatDateTime(announcement.createdAt, {
							timeZone: data.timeZone
						})}
					</span>
				</div>
				<ChevronRight size={32} class="text-secondary-foreground" />
			</a>
		{:else}
			<span class="text-secondary-foreground block text-center text-lg">ไม่มีประกาศในขณะนี้</span>
		{/each}
		{#if data.moreAnnouncementsAvailable}
			<a
				href={moreAnnouncementsLink}
				data-sveltekit-replacestate
				data-sveltekit-noscroll
				class="mx-auto !mt-8 block text-center text-lg text-primary-foreground underline">
				ดูเพิ่มเติม
			</a>
		{/if}
	</div>
</div>

<footer class="mx-16">
	<div class="mx-auto flex max-w-7xl items-center gap-8">
		<div class="w-0 flex-grow">
			<span class="mb-6 block break-keep text-2xl font-semibold text-black">
				ภาควิชาวิศวกรรมคอมพิวเตอร์ คณะวิศวกรรมศาสตร์ <br />
				สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง
			</span>
			<div class="flex items-center space-x-8">
				<div class="space-y-6">
					<div class="flex items-center gap-2">
						<Facebook color="#b47bfe" />
						<span class="text-base font-medium text-primary-foreground">CE Next Gen AI</span>
					</div>
					<div class="flex items-center gap-2">
						<Instagram color="#b47bfe" />
						<span class="text-base font-medium text-primary-foreground">CE Next Gen AI</span>
					</div>
				</div>
				<div class="flex items-center gap-2">
					<Pin color="#b47bfe" />
					<span class="text-base font-medium text-primary-foreground">
						อาคารปฏิบัติการรวมวิศวกรรมศาสตร์ 2 (ECC)
						<br />
						เลขที่ 1 ซอยฉลองกรุง 1 แขวงลาดกระบัง เขตลาดกระบัง
						<br />
						กรุงเทพมหานคร 10520
					</span>
				</div>
			</div>
		</div>
		<div class="flex items-center gap-4">
			<img src={kmitl} width="256" height="257" alt="KMITL logo" class="h-32 w-32" />
			<img src={ce} width="256" height="257" alt="CE-KMITL logo" class="h-32 w-32" />
		</div>
	</div>
</footer>
