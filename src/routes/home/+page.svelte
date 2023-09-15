<script>
  import { goto } from '$app/navigation'
  import { mdiBookOutline, mdiAccountGroupOutline, mdiInformationOutline, mdiPoll, mdiCog, mdiLogout } from '@mdi/js'
  import { AIcon } from 'ace.svelte'
  import { loading } from '$lib/stores.js'
  import srpc from '$lib/srpc.js'
  import swal from 'sweetalert2'
  import model from '$lib/model.js'
  import moment from 'moment'
  export let data
  
  const LS = window.localStorage, SS = window.sessionStorage
  let origin = { power: 0, count: 0 }
  let delta = { count: 0, power: 0 }
  $: delta = {
    count: (meta.count || 0) - origin.count,
    power: ((meta.power || 0) - origin.power).toFixed(1)
  }
  let meta = JSON.parse(LS.meta || '{}')
  let hasReview = false

  async function sync () {
    $loading = 'Sync your progress ...'
    if (data.user.id !== LS.user) { // different user
      await model.pro.clear()
      LS.removeItem('meta')
      LS.removeItem('new')
      meta = {}
    }
    LS.user = data.user.id
    const remote = await srpc.user.getMeta(data.user.token)
    origin.power = (remote.power || 0) - (remote.powerDelta || 0)
    origin.count = (remote.count || 0) - (remote.countDelta || 0)
    origin = origin
    delete remote.powerDelta
    delete remote.countDelta
    const local = JSON.parse(LS.meta || '{}')
    if ((remote.time || 0) > (local.time || 0)) { // update local
      const full = await srpc.user.get(data.user.token)
      await model.import(full.data)
      LS.meta = JSON.stringify(full.meta)
      meta = remote
    }
    if ((remote.time || 0) < (local.time || 0)) { // update remote
      // compute count and power
      const all = await model.pro.all()
      let sum = 0
      for (const p of all) sum += model.power(p.step)
      local.power = sum
      local.count = all.length
      await srpc.user.put(data.user.token, await model.export(), local)
      meta = local
      LS.meta = JSON.stringify(meta)
    }
    $loading = false
  }

  if (!data.user) goto('/')
  else sync()

  function signout () {
    LS.removeItem('token')
    goto('/')
  }

  async function book () {
    if (meta.book) {
      const { isConfirmed } = await swal.fire({
        title: '更换单词书',
        html: '<b style="color: red;">您的背单词进度将被清除！</b><br>是否继续前往更换单词书？',
        icon: 'warning',
        showCancelButton: true
      })
      if (!isConfirmed) return
    }
    goto('/book')
  }

  function start (newWordsNumber) {
    $loading = '背单词要对自己负责哦！'
    SS.removeItem('new')
    if (newWordsNumber) goto('/word?new=' + newWordsNumber)
    else goto('/word')
  }

  async function startNew () {
    if (!LS.new) LS.new = '20'
    const { value } = await swal.fire({
      title: '学习新单词',
      input: 'number',
      icon: 'success',
      inputValue: Number(LS.new),
      inputLabel: '加入新单词的数量：',
      inputPlaceholder: '新单词的数量'
    })
    if (!value) return
    LS.new = value
    start(value)
  }

  // check review
  setInterval(async () => {
    if (!meta.book) return
    const first = await model.pro.first()
    if (first && first.due < model.time()) hasReview = true
    else hasReview = false
  }, 1e3)
</script>

<div class="h-screen w-screen px-4 sm:px-10 py-10 bg-gray-100">
  <h1 class="text-3xl">Hi, {data.user.name}</h1>
  <p class="text-gray-500 text-sm">Ace your words in a simple but powerful way!</p>
  <div class="my-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 select-none">
    <div class="rounded border bg-white flex flex-col p-2">
      <button class="flex items-center" on:keypress={book} on:click={book}>
        <AIcon path={mdiBookOutline} size="1.5rem" color="rgb(55 65 81)" />
        <b class="ml-1">{meta.bookName || '请选择单词书'}</b>
      </button>
      <div class="font-mono m-2 flex">
        <b class="text-4xl">{meta.count || 0}</b>
        <div class="flex flex-col justify-between text-xs">
          <b>{(delta.count < 0 ? '' : '+') + delta.count}</b>
          <span class="text-gray-500">/{meta.bookCount || 'NaN'}</span>
        </div>
        <b class="text-4xl ml-4">{(meta.power || 0).toFixed(1)}</b>
        <div class="flex flex-col justify-between text-xs">
          <b>{(delta.power < 0 ? '' : '+') + delta.power}</b>
          <span class="text-gray-500">词力</span>
        </div>
      </div>
      <code class="block mx-2 text-xs text-gray-300">{meta.time ? moment(meta.time).format('YYYY-MM-DD HH:mm:ss') : 'No Record'}</code>
      {#if meta.book}
        <div class="items-stretch flex items-center mt-2">
          <button on:click={() => start()} disabled={!hasReview} class={'grow transition-all shadow hover:shadow-md rounded p-2 m-2 bg-blue-500 text-white font-bold ' + (hasReview ? 'bg-blue-500' : 'bg-gray-500')}>{hasReview ? '复习单词' : '暂无复习'}</button>
          <button on:click={startNew} class="grow transition-all shadow hover:shadow-md rounded p-2 m-2 bg-purple-500 text-white font-bold">学习新单词</button>
        </div>
      {/if}
    </div>
    <div class="flex flex-col my-4 sm:my-0 sm:mx-4">
      <button class="text-xl text-gray-700 rounded p-4 transition-all shadow hover:shadow-md flex items-center bg-white" on:keypress={() => goto('/group')} on:click={() => goto('/group')}>
        <AIcon path={mdiAccountGroupOutline} size="2rem" color="rgb(55 65 81)" />
        <b class="ml-2">我的小组</b>
      </button>
      <button class="text-xl text-gray-700 rounded p-4 transition-all shadow hover:shadow-md flex items-center bg-white mt-2" on:keypress={() => goto('/progress')} on:click={() => goto('/progress')}>
        <AIcon path={mdiPoll} size="2rem" color="rgb(55 65 81)" />
        <b class="ml-2">单词进度</b>
      </button>
    </div>
    <div class="flex flex-col my-4 lg:my-0 lg:mx-4">
      <button class="text-xl text-gray-700 rounded p-4 transition-all shadow hover:shadow-md flex items-center bg-white" on:keypress={() => goto('/about')} on:click={() => goto('/about')}>
        <AIcon path={mdiInformationOutline} size="2rem" color="rgb(55 65 81)" />
        <b class="ml-2">关于Acewords</b>
      </button>
    </div>
  </div>
  <div class="mt-2 mb-10 flex items-center">
    <button class="flex items-center text-gray-500 font-bold" on:click={() => goto('/settings')} on:keypress={() => goto('/settings')}>
      <AIcon path={mdiCog} size="1.5rem" color="rgb(107 114 128)" />
      <span class="ml-1">Settings</span>
    </button>
    <button class="ml-10 flex items-center text-gray-500 font-bold" on:click={signout} on:keypress={signout}>
      <AIcon path={mdiLogout} size="1.5rem" color="rgb(107 114 128)" />
      <span class="ml-1">Sign out</span>
    </button>
  </div>
  
</div>
