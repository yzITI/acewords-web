<script>
  import { goto } from '$app/navigation'
  import { mdiCogOutline, mdiChevronLeft } from '@mdi/js'
  import { AIcon, ASwitch, AAttach } from 'ace.svelte'

  const LS = window.localStorage
  let settings = $state(JSON.parse(LS.settings || '{ "definition": false, "exchange": false, "skip": false }'))
  $effect(() => LS.settings = JSON.stringify(settings))
  let test = $state(false)
</script>

<div class="min-h-screen w-full px-4 sm:px-10 py-10 bg-gray-100">
  <h1 class="text-2xl font-bold flex items-center select-none">
    <button class="transition-all pl-2 hover:pr-2 hover:pl-0" onclick={() => goto('/home')}><AIcon path={mdiChevronLeft} size="2.5rem" /></button>
    <AIcon path={mdiCogOutline} size="2rem" />
    <span class="text-2xl ml-1">设置</span>
  </h1>
  <p class="text-gray-400 text-sm ml-12">设置仅应用于当前设备</p>
  <hr class="my-2">
  <div class="px-2 text-gray-700 select-none">
    <div class="flex items-center">
      <span class="m-2">显示单词原始定义</span>
      <ASwitch bind:value={settings.definition} />
    </div>
    <div class="flex items-center">
      <span class="m-2">显示单词变形</span>
      <ASwitch bind:value={settings.exchange} />
    </div>
    <div class="flex items-center">
      <span class="m-2">允许跳过复习</span>
      <ASwitch bind:value={settings.skip} />
    </div>
  </div>
</div>
