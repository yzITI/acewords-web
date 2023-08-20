<script>
  import { mdiBookOutline, mdiMagnify } from '@mdi/js'
  import { AIcon } from 'ace.svelte'
  export let data
</script>

<div class="h-screen w-screen px-4 sm:px-10 py-10 bg-gray-100">
  <h1 class="text-3xl">Hi, {data.user.name}</h1>
  <p class="text-gray-500 text-sm">Ace your words in a simple but powerful way!</p>
  <div class="mt-6 text-xl font-bold text-gray-700 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
    <div class="rounded p-4 m-4 transition-all shadow hover:shadow-md cursor-pointer flex items-center bg-blue-500 text-white">
      <AIcon path={mdiBookOutline} size="2rem" color="white" />
      <span class="ml-2">开始背单词！</span>
    </div>
    <div class="rounded p-4 m-4 transition-all shadow hover:shadow-md cursor-pointer flex items-center bg-white">
      <AIcon path={mdiMagnify} size="2rem" color="rgb(55 65 81)" />
      <span class="ml-2">单词检索</span>
    </div>
  </div>
</div>
