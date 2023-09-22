<script>
  import { goto } from '$app/navigation'
  import { mdiChevronLeft, mdiBookOutline, mdiClockOutline } from '@mdi/js'
  import { AIcon } from 'ace.svelte'
  import { loading } from '$lib/stores.js'
  import srpc from '$lib/srpc.js'
  import swal from 'sweetalert2'
  import model from '$lib/model.js'
  import moment from 'moment'

  const LS = window.localStorage
  let total = 0
  let meta = JSON.parse(LS.meta || '{}')
  let statistics = JSON.parse(LS.statistics || '{"true":0,"false":0,"trueTime":0,"falseTime":0}')
  let TPercent = 0, FPercent = 0
  $: TPercent = 100 * statistics.true / (statistics.true + statistics.false) || 0
  $: FPercent = 100 * statistics.false / (statistics.true + statistics.false) || 0

  const stepTimeDescription = ['0s', '10s', '30s', '2m', '5m', '30m', '12h', '1d', '2d', '4d', '7d', '15d', '1M', '2M', '3M', '6M', 'INF']
  let distribution = JSON.parse(JSON.stringify(model.stepTime)).map(x => [0, 0, 0])
  async function computeDistribution () {
    const all = await model.pro.all()
    for (const w of all) {
      total++
      distribution[w.step][0]++
      if (w.due < model.time() + 2 * 86400) distribution[w.step][1]++
      if (w.due < model.time() + 86400) distribution[w.step][2]++
    }
    distribution = distribution
    total = total
  }
  if (meta.book) computeDistribution()
</script>

<div class="min-h-screen w-full px-2 sm:px-10 py-10 bg-gray-100">
  <h1 class="text-2xl font-bold flex items-center select-none">
    <button class="transition-all pl-2 hover:pr-2 hover:pl-0" on:click={() => goto('/home')}><AIcon path={mdiChevronLeft} size="2.5rem" /></button>
    <span class="text-3xl">单词进度</span>
  </h1>
  {#if meta.book}
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
    <h3 class="mx-4 font-bold text-lg">单词进度统计</h3>
    <p class="mx-4 text-xs text-gray-500">单词复现周期统计：24h内复习为红色，48h内复习为黄色</p>
    <div class="border m-4 rounded overflow-hidden">
      <div class="w-full h-6 bg-white relative flex items-center justify-between">
        <div class="text-xs font-bold mx-1">Timing</div>
        <div class="text-xs font-bold mx-1">Count</div>
      </div>
      {#each distribution as cot, step}
        <div class="w-full h-6 bg-white border-t relative flex items-center justify-between">
          <div class="absolute left-0 top-0 bg-blue-200 h-full" style={`width: ${100 * cot[0] / total}%;`}></div>
          <div class="absolute left-0 top-0 bg-yellow-200 h-full" style={`width: ${100 * cot[1] / total}%;`}></div>
          <div class="absolute left-0 top-0 bg-red-200 h-full" style={`width: ${100 * cot[2] / total}%;`}></div>
          <code class="z-0 text-xs font-bold mx-1">{stepTimeDescription[step]}</code>
          {#if cot[0]}
            <code class="z-0 text-xs mx-1">({(100 * cot[0] / total).toFixed(1)}%) <b>{cot[0]}</b></code>
          {/if}
        </div>
      {/each}
    </div>
    <h3 class="mx-4 font-bold text-lg">响应与时间统计</h3>
    <p class="mx-4 text-xs text-gray-500">数据仅来自本设备、本单词书</p>
    <div class="m-4 h-8 bg-white rounded border flex items-center text-xs relative">
      <p class="text-gray-500 absolute left-2">暂无响应统计数据</p>
      <div class="bg-green-200 h-full overflow-hidden flex items-center justify-end font-mono relative" style:width={TPercent + '%'}>
        <b class="mx-1">{statistics.true}</b>
        ({TPercent.toFixed(1)}%)
      </div>
      <div class="bg-red-200 h-full overflow-hidden flex items-center justify-start font-mono relative" style:width={FPercent + '%'}>
        ({FPercent.toFixed(1)}%)
        <b class="mx-1">{statistics.false}</b>
      </div>
    </div>
    <div class="rounded border bg-white flex flex-col p-2 m-4" style="max-width: 400px;">
      <div class="flex items-center">
        <AIcon path={mdiClockOutline} size="1.5rem" color="rgb(55 65 81)" />
        <b class="ml-1">平均响应时间（秒）</b>
      </div>
      <div class="font-mono m-4 flex whitespace-nowrap">
        <div class="flex flex-col justify-between items-end text-xs">
          <b class="text-sm">{(statistics.trueTime / statistics.true / 1000).toFixed(1)}</b>
          <span class="text-green-500">正确</span>
        </div>
        <b class="text-4xl">{((statistics.trueTime + statistics.falseTime) / (statistics.true + statistics.false) / 1000).toFixed(1)}</b>
        <div class="flex flex-col justify-between text-xs">
          <b class="text-sm">{(statistics.falseTime / statistics.false / 1000).toFixed(1)}</b>
          <span class="text-red-500">错误</span>
        </div>
        <div class="flex flex-col items-center justify-center text-xs ml-10">
          <b class="text-xl">{statistics.true + statistics.false}</b>
          <span class="text-gray-500">统计总数</span>
        </div>
      </div>
    </div>
  {:else}
    <p class="m-4 text-gray-500">您还没有单词进度哦，去选择一本单词书开始学习吧！</p>
  {/if}
</div>
