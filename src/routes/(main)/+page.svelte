<script lang="ts">
	import { ChevronRight, Facebook, Instagram, Pin } from '@lucide/svelte';

	import { base } from '$app/paths';

	import { formatDate, formatDateTime } from '$lib/utils';

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

	// TODO: Load announcements from database
	const announcements: { id: string; title: string; date: Date; url: string }[] = [
		{
			id: 'isretnrset',
			title: 'World Wars III have begun',
			date: new Date(2025, 3, 19, 13, 59, 42),
			url: '/announcements/isretnrset'
		},
		{
			id: 'khuyaloursyt',
			title:
				"Really long title because someone doesn't understand what title mean and put the whole content in this box instead of a summary of what the content is, thank you humans.",
			date: new Date(2025, 3, 20, 6, 12, 53),
			url: '/announcements/khuyaloursyt'
		}
	];
</script>

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
		<!--
			TODO: Redirect the button elsewhere if the user is logged in
		-->
		<a
			href="{base}/auth/register"
			class="button-gradient rounded-full px-6 py-2 text-xl font-semibold text-white drop-shadow-md transition-colors motion-reduce:transition-none">
			Join Us
		</a>
	</div>
	<img src={robots} alt="Robots" class="-z-10 -mb-80 -ml-16 -mt-40 h-fit w-0 flex-grow-[4]" />
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
		<img src={robot_trophy} alt="Robot holding a trophy decoration" class="-mt-16 h-fit w-48" />
	</div>
	<div class="mx-16 -mt-8 flex flex-col items-center">
		<div class="mt-8 flex w-full justify-evenly gap-4">
			<div class="flex w-96 flex-col items-center rounded-xl bg-white p-4 drop-shadow-lg">
				<img src={badge_10} alt="Badge 10" class="absolute -top-20 h-fit w-48 drop-shadow-lg" />
				<h3 class="text-gradient mb-4 mt-52 text-4xl font-bold">10 อันดับแรก</h3>
				<p class="text-center text-xl leading-relaxed text-primary-foreground">
					รับโควตาพิเศษ TCAS69 รอบ Portfolio ก้าวเข้าสู่มหาวิทยาลัยในฝันของคุณได้ทันที!
				</p>
			</div>
			<div class="flex w-96 flex-col items-center rounded-xl bg-white p-4 drop-shadow-lg">
				<img src={badge_50} alt="Badge 50" class="absolute -top-20 h-fit w-48 drop-shadow-lg" />
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
		<img src={robot_wand} alt="Robot holding a wand decoration" class="z-10 -mt-16 h-fit w-56" />
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
			<img src={binder} alt="Binder decoration" class="absolute -top-8 left-16 h-16 w-fit" />
			<img src={binder} alt="Binder decoration" class="absolute -top-8 right-16 h-16 w-fit" />
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
			alt="Robot holding a checklist decoration"
			class="-mt-16 h-fit w-56" />
	</div>
	<div class="mx-auto -mt-48 flex max-w-screen-2xl items-center pr-16">
		<img src={robot_love_thing} alt="Robots" class="-z-10 h-fit w-0 flex-grow" />
		<div class="ml-16 w-0 flex-grow space-y-4 xl:mx-32 2xl:flex-grow-[2]">
			{#each requirements as requirement (requirement)}
				<div class="flex items-center gap-2">
					<img src={check_icon} alt="Checkmark" class="h-8 w-8" />
					<span class="text-lg text-primary-foreground">{requirement}</span>
				</div>
			{/each}
		</div>
	</div>
</div>

<div class="mb-24">
	<div class="flex justify-between">
		<img src={robot_announce} alt="Robot announcing decoration" class="-mt-16 h-fit w-56" />
		<div class="flex w-0 flex-grow flex-col items-center">
			<h2 class="mb-4 text-4xl font-semibold">Announcements</h2>
			<p class="max-w-xl text-center text-xl leading-relaxed text-primary-foreground">
				ติดตามข่าวสารและประกาศสำคัญเกี่ยวกับโครงการ CE Next Gen AI
				เพื่อไม่พลาดโอกาสสำคัญในการพัฒนาทักษะและเข้าร่วมกิจกรรมต่างๆ
			</p>
		</div>
		<div class="w-64 flex-shrink"></div>
	</div>
	<div class="mx-16 -mt-16 space-y-4">
		{#each announcements as announcement (announcement.id)}
			<a
				href={announcement.url}
				class="mx-auto flex max-w-7xl items-center gap-4 rounded-xl bg-white p-4 drop-shadow-lg">
				<img src={bell} alt="Bell" class="h-12 w-12" />
				<div class="w-0 flex-grow overflow-hidden">
					<span
						class="block overflow-hidden text-ellipsis text-nowrap text-lg font-semibold text-primary-foreground">
						{announcement.title}
					</span>
					<span class="text-secondary-foreground">{formatDateTime(announcement.date)}</span>
				</div>
				<ChevronRight size={32} class="text-secondary-foreground" />
			</a>
		{:else}
			<span class="text-secondary-foreground block text-center text-lg">ไม่มีประกาศในขณะนี้</span>
		{/each}
		{#if announcements.length > 0}
			<button class="mx-auto !mt-8 block text-lg text-primary-foreground underline">
				ดูเพิ่มเติม
			</button>
			<!--
				TODO: Finish load more button
			-->
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
			<img src={kmitl} alt="KMITL logo" class="h-32 w-32" />
			<img src={ce} alt="CE-KMITL logo" class="h-32 w-32" />
		</div>
	</div>
</footer>
