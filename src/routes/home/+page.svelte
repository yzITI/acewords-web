<script>
  import { goto } from '$app/navigation'
  import { mdiBookOutline, mdiAccountGroupOutline, mdiInformationOutline, mdiPoll, mdiCog, mdiLogout } from '@mdi/js'
  import { AIcon } from 'ace.svelte'
  import { LS, SS, S } from '$lib/S.svelte'
  import fireImg from '$lib/images/fire.svg'
  import srpc from '$lib/srpc.js'
  import swal from 'sweetalert2'
  import model from '$lib/model.js'
  import moment from 'moment'
  let { data } = $props()
  
  let syncing = $state(false)
  let origin = $state({ power: 0, count: 0 })
  let delta = $state({ count: 0, power: 0 })
  $effect(() => delta = {
    count: (meta.count || 0) - origin.count,
    power: ((meta.power || 0) - origin.power).toFixed(1)
  })
  let meta = $state(JSON.parse(LS.meta || '{}'))
  let hasReview = $state(false)

  async function sync () {
    syncing = true
    if (!SS.sync) S.loading = 'Sync your progress ...'
    SS.sync = 1
    if (data.user.id !== LS.user) { // different user
      await model.pro.clear()
      LS.removeItem('meta')
      LS.removeItem('statistics')
      LS.removeItem('new')
      meta = {}
    }
    LS.user = data.user.id
    // fetch remote meta and compute origin from delta
    const remote = await srpc.user.getMeta(data.user.token)
    origin.power = (remote.power || 0) - (remote.powerDelta || 0)
    origin.count = (remote.count || 0) - (remote.countDelta || 0)
    origin = origin
    delete remote.powerDelta
    delete remote.countDelta
    const local = JSON.parse(LS.meta || '{}')
    // compare and sync record
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
    S.loading = false
    syncing = false
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
    S.loading = '背单词要对自己负责哦！'
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
    if (!meta.book || syncing) return
    const first = await model.pro.first()
    if (first && first.due < model.time()) hasReview = true
    else hasReview = false
  }, 1e3)
</script>

<div class="min-h-screen w-full px-4 sm:px-10 py-10 bg-gray-100 relative">
  <img src={fireImg} class="absolute right-0 sm:right-5 lg:right-10 bottom-0 w-1/2" style="min-width: 100px; max-width: 400px;">
  <h1 class="text-3xl">Hi, {data.user.name}</h1>
  <p class="text-gray-500 text-sm">Ace your words in a simple but powerful way!</p>
  <div class="my-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 select-none relative">
    <div class="rounded border bg-white flex flex-col p-2">
      <button class="flex items-center" onkeypress={book} onclick={book}>
        <AIcon path={mdiBookOutline} size="1.5rem" color="rgb(55 65 81)" />
        <b class="ml-1">{syncing ? '正在同步...' : (meta.bookName || '请选择单词书')}</b>
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
          <button onclick={() => start()} disabled={!hasReview} class={'w-1/2 transition-all duration-500 shadow hover:shadow-md rounded p-2 m-2 bg-blue-500 text-white font-bold ' + (hasReview ? 'bg-blue-500' : 'bg-gray-500')}>{hasReview ? '复习单词' : '暂无复习'}</button>
          <button onclick={startNew} disabled={syncing} class={'w-1/2 transition-all duration-500 shadow hover:shadow-md rounded p-2 m-2 bg-blue-500 text-white font-bold ' + (syncing ? 'bg-gray-500' : 'bg-purple-500')}>{syncing ? '正在同步' : '学习新单词'}</button>
        </div>
      {/if}
    </div>
    <div class="flex flex-col my-4 sm:my-0 sm:mx-4">
      <button class="text-xl text-gray-700 rounded p-4 transition-all shadow hover:shadow-md flex items-center bg-white" onkeypress={() => goto('/group')} onclick={() => goto('/group')}>
        <AIcon path={mdiAccountGroupOutline} size="2rem" color="rgb(55 65 81)" />
        <b class="ml-2">我的小组</b>
      </button>
      <button class="text-xl text-gray-700 rounded p-4 transition-all shadow hover:shadow-md flex items-center bg-white mt-2" onkeypress={() => goto('/progress')} onclick={() => goto('/progress')}>
        <AIcon path={mdiPoll} size="2rem" color="rgb(55 65 81)" />
        <b class="ml-2">单词进度</b>
      </button>
    </div>
    <div class="flex flex-col my-4 lg:my-0 lg:mx-4">
      <button class="text-xl text-gray-700 rounded p-4 transition-all shadow hover:shadow-md flex items-center bg-white" onkeypress={() => goto('/about')} onclick={() => goto('/about')}>
        <AIcon path={mdiInformationOutline} size="2rem" color="rgb(55 65 81)" />
        <b class="ml-2">关于Acewords</b>
      </button>
    </div>
  </div>
  <div class="mb-6 flex flex-col items-start relative">
    <button class="flex items-center text-gray-500 font-bold m-2" onclick={() => goto('/settings')} onkeypress={() => goto('/settings')}>
      <AIcon path={mdiCog} size="1.5rem" color="rgb(107 114 128)" />
      <span class="ml-1">Settings</span>
    </button>
    <button class="flex items-center text-gray-500 font-bold m-2" onclick={signout} onkeypress={signout}>
      <AIcon path={mdiLogout} size="1.5rem" color="rgb(107 114 128)" />
      <span class="ml-1">Sign out</span>
    </button>
  </div>
</div>
