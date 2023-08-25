<script>
  import { goto } from '$app/navigation'
  import { mdiBookOutline, mdiAccountGroupOutline, mdiLogout } from '@mdi/js'
  import { AIcon } from 'ace.svelte'
  import { loading } from '$lib/stores.js'
  import srpc from '$lib/srpc.js'
  import swal from 'sweetalert2'
  import model from '$lib/model.js'
  import moment from 'moment'
  export let data
  
  const LS = window.localStorage
  let meta = JSON.parse(LS.meta || '{}')
  let hasReview = false

  async function sync () {
    $loading = 'Sync your progress ...'
    if (data.user.id !== LS.user) { // different user
      await model.pro.clear()
      LS.removeItem('meta')
      LS.removeItem('new')
    }
    LS.user = data.user.id
    const remote = await srpc.user.getMeta(data.user.token)
    const local = JSON.parse(LS.meta || '{}')
    if ((remote.time || 0) > (local.time || 0)) { // update local
      const full = await srpc.user.get(data.user.token)
      await model.import(full.data)
      LS.meta = JSON.stringify(full.meta)
      meta = remote
    }
    if ((remote.time || 0) < (local.time || 0)) { // update remote
      await srpc.user.put(data.user.token, await model.export(), local)
      meta = local
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
      <div class="flex items-center" on:keypress={book} on:click={book}>
        <AIcon path={mdiBookOutline} size="1.5rem" color="rgb(55 65 81)" />
        <b class="ml-1">{meta.bookName || '请选择单词书'}</b>
      </div>
      <h2 class="font-mono m-2"><b class="text-4xl">{(meta.power || 0).toFixed(1)}</b>/{meta.bookCount || 'NaN'}</h2>
      <code class="block mx-2 text-xs text-gray-300">{meta.time ? moment(meta.time).format('YYYY-MM-DD HH:mm:ss') : 'No Record'}</code>
      {#if meta.book}
        <div class="items-stretch flex items-center mt-2">
          <button on:click={() => start()} disabled={!hasReview} class={'grow transition-all shadow hover:shadow-md rounded p-2 m-2 bg-blue-500 text-white font-bold ' + (hasReview ? 'bg-blue-500' : 'bg-gray-500')}>{hasReview ? '复习单词' : '暂无复习'}</button>
          <button on:click={startNew} class="grow transition-all shadow hover:shadow-md rounded p-2 m-2 bg-purple-500 text-white font-bold">学习新单词</button>
        </div>
      {/if}
    </div>
    <div class="flex flex-col my-4 sm:my-0 sm:mx-4">
      <div class="text-xl text-gray-700 rounded p-4 transition-all shadow hover:shadow-md cursor-pointer flex items-center bg-white" on:keypress={() => goto('/group')} on:click={() => goto('/group')}>
        <AIcon path={mdiAccountGroupOutline} size="2rem" color="rgb(55 65 81)" />
        <b class="ml-2">我的小组</b>
      </div>
    </div>
  </div>
  <button class="mt-2 mb-10 flex items-center text-gray-500 font-bold" on:click={signout} on:keypress={signout}>
    <AIcon path={mdiLogout} size="1.5rem" color="rgb(107 114 128)" />
    <span class="ml-1">Sign out</span>
  </button>
</div>
