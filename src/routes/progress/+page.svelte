<script>
  import { goto } from '$app/navigation'
  import { mdiChevronLeft, mdiBookOutline } from '@mdi/js'
  import { AIcon } from 'ace.svelte'
  import { loading } from '$lib/stores.js'
  import srpc from '$lib/srpc.js'
  import swal from 'sweetalert2'
  import model from '$lib/model.js'
  import moment from 'moment'

  const LS = window.localStorage
  let meta = JSON.parse(LS.meta || '{}')
  let total = 0

  const stepTimeDescription = ['0s', '10s', '30s', '2m', '5m', '30m', '12h', '1d', '2d', '4d', '7d', '15d', '1M', '2M', '3M', '6M', 'INF']
  let distribution = JSON.parse(JSON.stringify(model.stepTime)).map(x => 0)
  async function computeDistribution () {
    const all = await model.pro.all()
    for (const w of all) distribution[w.step]++
    distribution = distribution
    total = distribution.reduce((a, b) => a + b)
  }
  if (meta.book) computeDistribution()
</script>

<div class="min-h-screen w-screen px-4 sm:px-10 py-10 bg-gray-100">
  <h1 class="text-2xl font-bold flex items-center select-none">
    <button class="transition-all pl-2 hover:pr-2 hover:pl-0" on:click={() => goto('/home')}><AIcon path={mdiChevronLeft} size="2.5rem" /></button>
    <span class="text-3xl">单词进度</span>
  </h1>
  {#if meta.book}
    <p class="text-gray-400 text-sm ml-12">单词复现周期统计</p>
    <div class="rounded border bg-white flex flex-col p-2 m-4" style="max-width: 400px;">
      <div class="flex items-center">
        <AIcon path={mdiBookOutline} size="1.5rem" color="rgb(55 65 81)" />
        <b class="ml-1">{meta.bookName || ''}</b>
      </div>
      <div class="font-mono m-2 flex">
        <b class="text-4xl">{meta.count || 0}</b>
        <div class="flex flex-col justify-between text-xs">
          <b>&nbsp;</b>
          <span class="text-gray-500">/{meta.bookCount || 'NaN'}</span>
        </div>
        <b class="text-4xl ml-4">{(meta.power || 0).toFixed(1)}</b>
        <div class="flex flex-col justify-between text-xs">
          <b>&nbsp;</b>
          <span class="text-gray-500">词力</span>
        </div>
      </div>
      <code class="block mx-2 text-xs text-gray-300">{meta.time ? moment(meta.time).format('YYYY-MM-DD HH:mm:ss') : 'No Record'}</code>
    </div>
    <div class="border m-4 rounded overflow-hidden">
      <div class="w-full h-6 bg-white relative flex items-center">
        <div class="absolute left-1 text-xs font-bold">Timing</div>
        <div class="absolute right-1 text-xs font-bold">Count</div>
      </div>
      {#each distribution as cot, step}
        <div class="w-full h-6 bg-white border-t relative flex items-center">
          <div class="bg-blue-200 h-full" style={`width: ${100 * cot / total}%;`}></div>
          <code class="absolute left-1 text-xs font-bold">{stepTimeDescription[step]}</code>
          {#if cot}
            <code class="absolute right-1 text-xs">({(100 * cot / total).toFixed(1)}%) <b>{cot}</b></code>
          {/if}
        </div>
      {/each}
    </div>
  {:else}
    <p class="m-4 text-gray-500">您还没有单词进度哦，去选择一本单词书开始学习吧！</p>
  {/if}
</div>
