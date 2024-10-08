<script>
  import { goto } from '$app/navigation'
  import srpc from '$lib/srpc.js'
  import swal from 'sweetalert2'
  import model from '$lib/model.js'
  import { S, LS, SS } from '$lib/S.svelte'
  import { fade } from 'svelte/transition'

  let { data } = $props()
  let settings = $state(JSON.parse(LS.settings || '{}'))
  let statistics = $state(JSON.parse(LS.statistics || '{"true":0,"false":0,"trueTime":0,"falseTime":0}'))
  let totalCount = $state(NaN)
  let book = $state({})
  let meta = $state({})
  let newIDs = $state([])

  function shuffle (array) {
    for (let i = array.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1))
      let temp = array[i]
      array[i] = array[j]
      array[j] = temp
    }
  }

  const id2_id = id => `${book.lang}.${book.words[id]}`

  async function init () {
    meta = JSON.parse(LS.meta || '{}')
    if (!meta.book) return goto('/home')
    // fetch book with cache
    book = JSON.parse(LS.book || '{}')
    if (book._id !== meta.book) {
      book = await srpc.book.get(meta.book)
      if (!book.words) return goto('/')
      LS.book = JSON.stringify(book)
    }
    // get new words
    const old = await model.pro.all(true)
    const ids = Object.keys(book.words).map(x => Number(x))
    shuffle(ids)
    let cot = data.newWordsNumber
    for (const id of ids) {
      if (cot <= 0) break
      if (old.includes(id)) continue
      cot--
      newIDs.push(id)
    }
    newIDs = newIDs
    SS.new = newIDs.length
    // fetch lib for needed words: all new & old ids
    const _ids = [...new Set([...old, ...newIDs])].map(id2_id)
    const needs = []
    for (const _id of _ids) {
      if (await model.lib.get(_id)) continue
      needs.push(_id)
    }
    if (needs.length) {
      const libRes = await srpc.word.get(needs)
      await model.lib.put(libRes)
    }
    S.loading = false
  }

  S.loading = '背单词要对自己负责哦！'
  if (!data.user) goto('/')
  else if (SS.new > 0 && SS.new != data.newWordsNumber) goto('/word?new=' + SS.new) // refresh with remaining new words
  else init()

  let audio = new Audio()
  audio.autoplay = true
  function play () {
    audio.pause()
    audio.src = `https://dict.youdao.com/dictvoice?audio=${current.word}&type=1`
  }

  let show = $state(false)
  let cover = $state(true)
  let startTime = $state(0)
  let current = $state({})
  let currentPro = {}

  async function next () {
    current = {}
    show = false
    cover = false
    startTime = Date.now() // start timing
    totalCount = await model.pro.dueCount(model.time() + 15) + newIDs.length
    // find review
    currentPro = await model.pro.first()
    if (currentPro && currentPro.due <= model.time()) {
      current = await model.lib.get(id2_id(currentPro.id))
      return await play()
    }
    // new word
    const newID = newIDs.shift()
    newIDs = newIDs
    if (newID) {
      currentPro = { id: newID, step: 0, time: model.time(), due: model.time() }
      current = await model.lib.get(id2_id(newID))
      return await play()
    }
    // find review loosely
    if (currentPro && currentPro.due <= model.time() + 15) {
      current = await model.lib.get(id2_id(currentPro.id))
      return await play()
    }
    complete() // no words left
  }

  async function response (r, inc = 1) {
    const timing = Date.now() - startTime
    if (timing < 60e3) {
      statistics[r]++
      statistics[r + 'Time'] += timing
      LS.statistics = JSON.stringify(statistics)
    }
    // Update pro
    currentPro.step = r ? (currentPro.step + inc) : 1
    if (currentPro.step > 16) currentPro.step = 16
    currentPro.time = model.time()
    currentPro.due = currentPro.time + model.stepTime[currentPro.step]
    await model.pro.put(currentPro)
    // Update meta
    meta.time = Date.now()
    LS.meta = JSON.stringify(meta)
    SS.new = newIDs.length // save in case of refresh page
    await next()
  }

  async function complete () {
    await swal.fire('任务完成', '记得多回来复习哦！', 'success')
    goto('/home')
  }
</script>

<div class="h-screen w-screen px-4 py-16 bg-gray-100 flex flex-col items-center justify-between">
  {#if current.word}
    <div class="flex flex-col items-center w-full" style="max-width: 360px;">
      <h2 class="text-4xl font-bold" onclick={play} onkeypress={play}>{current.word}</h2>
      <p class="italic text-gray-700 my-2" onclick={play} onkeypress={play}>/{current.phonetic}/</p>
      {#if show}
        <div class="w-full border bg-white rounded p-2 mt-6 transition-all">
          {#each current.translation as t}
            <p class="m-1">{t}</p>
          {/each}
        </div>
        {#if settings.definition && current.definition?.length}
          <div class="w-full border bg-white rounded p-2 mt-3 transition-all">
            {#each current.definition as d}
              <p class="m-1 text-sm leading-tight">{d}</p>
            {/each}
          </div>
        {/if}
        {#if settings.exchange && current.exchange?.length}
          <div class="w-full border bg-white rounded p-2 mt-3 transition-all flex flex-wrap">
            {#each current.exchange as e}
              <div class="m-1 text-sm leading-tight">{e}</div>
            {/each}
          </div>
        {/if}
      {:else}
        <div class="my-6 text-center text-gray-500">跟读单词<br>说出单词释义<br>查看释义判断正误</div>
      {/if}
    </div>
    <div class="flex items-end justify-between my-4 font-bold text-lg w-full" style="max-width: 400px;">
      {#if show}
        <button onclick={() => response(false)} class="transition-all shadow hover:shadow-md rounded w-1/2 p-2 bg-red-500 text-white mx-2">错误</button>
        <div class="flex flex-col items-center w-1/2">
          {#if settings.skip}
            <button onclick={() => response(true, 2)} class="transition-all hover:bg-gray-200 rounded py-2 px-4 text-yellow-500 mx-2 mb-4 text-base">跳过复习</button>
          {/if}
          <button onclick={() => response(true)} class="transition-all shadow hover:shadow-md rounded w-full p-2 bg-green-500 text-white mx-2">正确</button>
        </div>
      {:else}
        <button onclick={() => show = true} class="transition-all shadow hover:shadow-md rounded w-full p-2 bg-blue-500 text-white">查看释义</button>
      {/if}
    </div>
  {/if}
  <code class="fixed top-2 left-2 text-xs text-gray-500">total: {totalCount}</code>
  {#if data.newWordsNumber}
    <code class="fixed top-2 right-2 text-xs text-gray-500">new: {newIDs.length}/{data.newWordsNumber}</code>
  {/if}
</div>
{#if cover}
  <div transition:fade class="fixed w-screen h-screen bg-gray-100 top-0 left-0 flex items-center justify-center" onclick={next} onkeypress={next}>
    <p>轻触屏幕开始学习单词</p>
  </div>
{/if}
