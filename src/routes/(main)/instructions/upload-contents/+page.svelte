<script lang="ts">
	import announcementExample from '$lib/images/example-announcement.avif';
	import examExample from '$lib/images/example-exam.avif';
	import zipInstruction from '$lib/images/instruction-zip.gif';
</script>

<svelte:head>
	<title>CE Next Gen AI - Uploading Contents</title>
</svelte:head>

<div class="mx-auto mt-4 max-w-7xl px-16">
	<h1 class="mb-4 text-4xl font-semibold">Uploading Contents</h1>
	<ol class="ml-8 list-decimal space-y-8 text-lg">
		<li>
			Have your content in the following file structure
			<ul class="mb-2 ml-4 list-disc">
				<li>The source file (markdown or excel spreadsheet) must be in the root directory</li>
				<li>
					Asset files (images, etc.) must be in the same folder or a sub-folder (there is no depth
					limit)
				</li>
			</ul>
			<div class="flex flex-wrap justify-evenly gap-8">
				<img
					src={examExample}
					width="640"
					height="576"
					alt="Example exam folder structure"
					class="h-80 w-fit rounded-xl" />
				<img
					src={announcementExample}
					width="512"
					height="555"
					alt="Example announcement folder structure"
					class="h-80 w-fit rounded-xl" />
			</div>
		</li>
		<li>
			Zip the file and assets, <strong>do NOT zip the folder containing the file and assets</strong>
			<img
				src={zipInstruction}
				alt="Instruction on how to zip folder"
				width="1280"
				height="720"
				class="mt-2 h-fit w-full rounded-xl" />
		</li>
		<li>Upload the .zip file to create your content</li>
	</ol>
</div>
