<script>
	import { onMount } from "svelte";
	import axios from "axios";
	import { fade } from "svelte/transition";

	export let apikey;
	let isMenuVisible = false;
	let isRecording = false;
	let isResponseAvailable = false;

	let media = [];
	let mediaRecorder = null;

	let response = "";

	async function query(blob) {
		let fd = new FormData();
		fd.append("file", blob, genRand(7) + ".mp3");
		fd.append("apiKey", apikey);
		const { data } = await axios.post(
			"http://localhost:8000/api/talk-to-agent",
			fd
		);
		return data;
	}
	const genRand = (len) => {
		return Math.random()
			.toString(36)
			.substring(2, len + 2);
	};

	onMount(async () => {
		const stream = await navigator.mediaDevices.getUserMedia({
			audio: true,
		});
		mediaRecorder = new MediaRecorder(stream);
		mediaRecorder.ondataavailable = (e) => media.push(e.data);
		mediaRecorder.onstop = async function () {
			const blob = new Blob(media, {
				audioBitsPerSecond: 32000,
				mimeType: "audio/mpeg",
			});
			const resp = await query(blob);
			if (resp && resp.audio) {
				isResponseAvailable = true;
				const audio = new Audio(
					"http://localhost:8000/quickaudio/" + resp.audio
				);
				audio.play();
				response = resp.response;
			}

			media = [];
		};
	});
	function playAudio(audio) {
		return new Promise((res) => {
			audio.play();
			audio.onended = res;
		});
	}
  async function playIntro() {
  const res = await axios.get("http://localhost:8000/api/landingpage-talk/" + apikey);
  if (res && res.data && res.data.response) {
    isResponseAvailable = true;

    for (const { audio, section_pitch, target_section_text } of res.data.response) {
      await findAndScrollToText(target_section_text);
      response = section_pitch;
      const a = new Audio("http://localhost:8000/quickaudio/" + audio);
      await playAudio(a);
    }
  }
}

	function findAndScrollToText(text) {
		const walker = document.createTreeWalker(
			document.body,
			NodeFilter.SHOW_TEXT,
			null,
			false
		);

		while (walker.nextNode()) {
			const node = walker.currentNode;
			if (node.textContent.includes(text)) {
				node.parentElement.scrollIntoView({
					behavior: "smooth",
					block: "center",
					inline: "center",
				});
				break;
			}
		}
	}
</script>

<section
	class="gomma fixed bottom-6 right-6 flex flex-col gap-2 p-4 rounded-xl z-50"
>
	{#if isResponseAvailable}
		<div class="bg-white p-4 rounded-xl border shadow-xl max-w-xs">
			{response}
		</div>
	{/if}

	<div class="gomma flex items-center gap-2">
		{#if isMenuVisible}
			<div
				transition:fade={{ delay: 250, duration: 300 }}
				class="bg-white border rounded-full p-2 flex gap-3 items-center"
			>
				<button on:click={playIntro} class="btn btn-circle m-0"
					><svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="w-6 h-6"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
						/>
					</svg>
				</button>
				{#if isRecording}
					<button
						on:click={() => {
							isRecording = false;
							mediaRecorder.stop();
						}}
						class="btn btn-circle m-0 bg-red-600"
						><svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="w-6 h-6"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z"
							/>
						</svg>
					</button>
				{:else}
					<button
						on:click={() => {
							media = [];
							isRecording = true;
							mediaRecorder.start();
						}}
						class="btn btn-circle m-0"
						><svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="w-6 h-6"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
							/>
						</svg>
					</button>
				{/if}
			</div>
		{/if}
		<button
			on:click={() => (isMenuVisible = !isMenuVisible)}
			class="btn btn-circle shadow-xl bg-gray-700 border-0 hover:bg-black"
		>
			{#if isMenuVisible}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="w-6 h-6 text-white"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			{:else}
				<svg
					viewBox="0 0 100 100"
					fill="none"
					class="w-5 h-5 text-white"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M100 50C100 77.6142 77.6142 100 50 100C22.3858 100 0 77.6142 0 50C0 22.3858 22.3858 0 50 0C77.6142 0 100 22.3858 100 50ZM25.5642 50C25.5642 63.4955 36.5045 74.4358 50 74.4358C63.4955 74.4358 74.4358 63.4955 74.4358 50C74.4358 36.5045 63.4955 25.5642 50 25.5642C36.5045 25.5642 25.5642 36.5045 25.5642 50Z"
						fill="white"
					/>
				</svg>
			{/if}
		</button>
	</div>
</section>

<style>
	@import url("https://api.fontshare.com/v2/css?f[]=general-sans@1&display=swap");
	@tailwind base;
	@tailwind components;
	@tailwind utilities;
	.gomma {
		font-family: "General Sans", sans-serif;
	}
</style>
