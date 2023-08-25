<script>
  import { goto } from '$app/navigation'
  import srpc from '$lib/srpc.js'
  import swal from 'sweetalert2'
  import model from '$lib/model.js'
  import { loading } from '$lib/stores.js'

  export let data
  const LS = window.localStorage
  let book = {}
  let meta = {}
  let newIDs = []

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
    // fetch book
    book = await srpc.book.get(meta.book)
    if (!book.words) return goto('/')
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
    // fetch lib: all new & old ids
    const _ids = [...new Set([...old, ...newIDs])].map(id2_id)
    const needs = []
    for (const _id of _ids) {
      if (await model.lib.get(_id)) continue
      needs.push(_id)
    }
    const libRes = await srpc.word.get(needs)
    await model.lib.put(libRes)
    $loading = false
    next()
  }

  if (!data.user) goto('/')
  else init()

  let audio
  function play () {
    if (audio) audio.pause()
    audio = new Audio(`https://dict.youdao.com/dictvoice?audio=${current.word}&type=1`)
    audio.play()
  }

  let show = false
  let current = {}
  let currentPro = {}

  async function next () {
    current = {}
    show = false
    // find review
    currentPro = await model.pro.first()
    if (currentPro && currentPro.due <= model.time()) {
      current = await model.lib.get(id2_id(currentPro.id))
      return play()
    }
    // new word
    const newID = newIDs.shift()
    newIDs = newIDs
    if (newID) {
      currentPro = { id: newID, step: 0, time: model.time(), due: model.time() }
      current = await model.lib.get(id2_id(newID))
      return play()
    }
    // find review loosely
    if (currentPro && currentPro.due <= model.time() + 25) {
      current = await model.lib.get(id2_id(currentPro.id))
      return play()
    }
    complete()
  }

  async function response (r) {
    currentPro.step = r ? (currentPro.step + 1) : 1
    if (currentPro.step > 16) currentPro.step = 16
    currentPro.time = model.time()
    currentPro.due = currentPro.time + model.stepTime[currentPro.step]
    console.log(currentPro.step, model.stepTime[currentPro.step])
    await model.pro.put(currentPro)
    next()
  }

  async function complete () {
    await swal.fire('任务完成', '记得多回来复习哦！', 'success')
    // compute power
    const all = await model.pro.all()
    let sum = 0
    for (const p of all) sum += model.power(p.step)
    meta.power = sum
    meta.time = Date.now()
    LS.meta = JSON.stringify(meta)
    goto('/home')
  }
</script>

<div class="h-screen w-screen px-4 py-16 bg-gray-100 flex flex-col items-center justify-between">
  {#if current.word}
    <div class="flex flex-col items-center w-full" style="max-width: 360px;">
      <h2 class="text-4xl font-bold" on:click={play} on:keypress={play}>{current.word}</h2>
      <p class="italic text-gray-700 my-2" on:click={play} on:keypress={play}>/{current.phonetic}/</p>
      {#if show}
        <div class="w-full border bg-white rounded p-2 my-6 transition-all">
          {#each current.translation as t}
            <p class="m-1">{t}</p>
          {/each}
        </div>
      {:else}
        <div class="my-6 text-center text-gray-500">说出单词释义<br>查看释义判断正误</div>
      {/if}
    </div>
    <div class="flex items-center justify-between my-4 font-bold text-lg w-full" style="max-width: 400px;">
      {#if show}
        <button on:click={() => response(false)} class="transition-all shadow hover:shadow-md rounded w-1/2 p-2 bg-red-500 text-white mx-2">错误</button>
        <button on:click={() => response(true)} class="transition-all shadow hover:shadow-md rounded w-1/2 p-2 bg-green-500 text-white mx-2">正确</button>
      {:else}
        <button on:click={() => show = true} class="transition-all shadow hover:shadow-md rounded w-full p-2 bg-blue-500 text-white">查看释义</button>
      {/if}
    </div>
  {/if}
  <code class="fixed top-2 right-2 text-xs text-gray-500">new: {newIDs.length}/{data.newWordsNumber}</code>
</div>