<script lang="ts">
	import robots from '$lib/images/3-robots.avif';
	import badge_10 from '$lib/images/badge-10.avif';
	import badge_50 from '$lib/images/badge-50.avif';
</script>

<div class="mb-24 flex items-center">
	<div class="w-0 flex-grow">
		<h1 class="mb-4 text-3xl font-semibold !leading-tight lg:text-4xl xl:text-5xl 2xl:text-6xl">
			Welcome to<br />
			<span class="text-gradient">CE NEXT GEN AI CAMP</span><br />
			The starting point for <wbr />world changers with AI.
		</h1>
		<p class="mb-8 text-xl leading-relaxed text-primary-foreground">
			กิจกรรมค่ายปัญญาประดิษฐ์ที่เปิดโอกาสให้คุณได้เรียนรู้ สร้างสรรค์ และก้าวสู่ความเป็นผู้นำด้าน
			AI ในอนาคต พบกับประสบการณ์ที่มากกว่าการเรียน ด้วยเวิร์กชอป มากมาย และการแข่งขันที่ท้าทาย
			เพื่อค้นหาศักยภาพ ในตัวคุณ ไม่ว่าคุณจะเริ่มต้นเส้นทางสาย AI หรืออยาก พัฒนาทักษะให้เฉียบคมขึ้น
			นี่คือจุดเริ่มต้นสำหรับคุณ
		</p>
		<a
			href="/register"
			class="button-gradient rounded-full px-6 py-2 text-xl font-semibold text-white drop-shadow-md transition-colors motion-reduce:transition-none">
			Join Us
		</a>
	</div>
	<div class="flex h-0 w-0 flex-grow items-center">
		<img src={robots} alt="Robots" class="relative top-12 -z-10 h-fit w-full" />
	</div>
</div>
<div class="flex flex-col items-center">
	<h2 class="mb-4 text-3xl font-semibold !leading-tight lg:text-4xl xl:text-5xl">
		Special Benefits
	</h2>
	<p class="mb-8 max-w-xl text-center text-xl leading-relaxed text-primary-foreground">
		เพราะทุกความสำเร็จ ไม่ว่าจะเล็กหรือใหญ่ สมควรได้รับการยอมรับ
		เพื่อเป็นแรงบันดาลใจให้คุณก้าวไปสู่ความสำเร็จที่ยิ่งใหญ่กว่าเดิม
	</p>
	<div class="mt-24 flex w-full justify-evenly gap-4">
		<div class="flex w-96 flex-col items-center rounded-xl bg-white p-4 drop-shadow-lg">
			<img src={badge_10} alt="Badge 10" class="absolute -top-20 h-fit w-48 drop-shadow-lg" />
			<h3 class="text-gradient-2 mb-4 mt-52 text-4xl font-bold">10 อันดับแรก</h3>
			<p class="text-center text-xl leading-relaxed text-primary-foreground">
				รับโควตาพิเศษ TCAS69 รอบ Portfolio ก้าวเข้าสู่มหาวิทยาลัยในฝันของคุณได้ทันที!
			</p>
		</div>
		<div class="flex w-96 flex-col items-center rounded-xl bg-white p-4 drop-shadow-lg">
			<img src={badge_50} alt="Badge 50" class="absolute -top-20 h-fit w-48 drop-shadow-lg" />
			<h3 class="text-gradient-2 mb-4 mt-52 text-4xl font-bold">50 อันดับแรก</h3>
			<p class="text-center text-xl leading-relaxed text-primary-foreground">
				รับเกียรติบัตรอย่างเป็นทางการ เพิ่มความโดดเด่นให้ Portfolio ของคุณ!
			</p>
		</div>
	</div>
</div>
