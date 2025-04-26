<script lang="ts">
	import { base } from '$app/paths';

	let { data } = $props();
</script>

<div
	class="prose prose-lg prose-neutral max-w-none prose-img:h-fit prose-img:w-full prose-img:max-w-md">
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html data.question.html}
</div>
<div class="mb-8 flex flex-wrap gap-8">
	{#each data.question.choices as choice (choice.number)}
		<div
			class="flex h-48 w-80 items-center justify-center overflow-y-scroll rounded-xl bg-white p-4">
			<div class="prose prose-neutral max-w-72 prose-img:h-fit prose-img:w-full prose-img:max-w-sm">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html choice.html}
			</div>
		</div>
	{/each}
</div>
<a
	href={`${base}/exercises/${data.exam.id}/${data.question.number - 1}`}
	class="button-gradient rounded-xl px-4 py-2 font-semibold text-white">
	Prev
</a>
<a
	href={`${base}/exercises/${data.exam.id}/${data.question.number + 1}`}
	class="button-gradient rounded-xl px-4 py-2 font-semibold text-white">
	Next
</a>
[
{JSON.stringify(data.exam)},
{JSON.stringify(data.questions)},
{JSON.stringify(data.submission)},
{JSON.stringify(data.question)}]
