
<script>
  import { goto } from '$app/navigation'
  import srpc from '$lib/srpc.js'
  import swal from 'sweetalert2'
  import { S, LS, SS } from '$lib/S.svelte'
  import { mdiBookOutline, mdiClockTimeFourOutline } from '@mdi/js'
  import { AIcon } from 'ace.svelte'
  let input = $state('')
  let info = $state({ _id: 'loading' })
  let list = $state([])
  let last = $state(null)
  let time = $state('')
  async function init () {
    S.loading = true
    info = await srpc.guess.get()
    const cache = JSON.parse(LS.guess || '{}')
    if (cache._id === info._id) list = cache.list
    else LS.removeItem('guess')
    S.loading = false
  }
  init()
  let trying = false
  async function submit (e) {
    if (trying || e.key !== 'Enter' || !input.match(/\S/)) return
    const word = input = input.toLowerCase()
    for (const l of list) {
      if (l.word === word) {
        last = l
        input = ''
        return
      }
    }
    trying = true
    const d = await srpc.guess.try(word)
    trying = false
    input = ''
    if (d < 0) return last = { word: 'unknown word / out of range', score: 0, dist: 1 }
    last = { word, dist: d }
    last.score = Math.max(0, 100 - (d * 2.2) ** 7 * 100)
    if (last.dist <= 0) last.color = 'bg-green-300'
    else if (last.score > 90) last.color = 'bg-purple-300'
    else if (last.score > 75) last.color = 'bg-blue-300'
    else if (last.score > 50) last.color = 'bg-amber-300'
    else if (last.score > 20) last.color = 'bg-orange-300'
    else last.color = 'bg-red-300'
    list.push(last)
    list.sort((a, b) => a.dist - b.dist)
    LS.guess = JSON.stringify({ _id: info._id, list })
  }
  async function countDown (ms) {
    while (1) {
      await new Promise(r => setTimeout(r, 1e3))
      if (!info.time) {
        time = ''
        continue
      }
      const delta = 86400e3 - (Date.now() - info.time)
      if (delta < 0) {
        await init()
        list = []
        last = null
      }
      const hr = Math.trunc(delta / 3600e3).toString(), min = Math.trunc(delta % 3600e3 / 60e3).toString(), sec = Math.trunc(delta % 60e3 / 1e3).toString()
      time = `${hr.padStart(2, '0')}:${min.padStart(2, '0')}:${sec.padStart(2, '0')}`
    }
  }
  countDown()
</script>

<div class="min-h-screen w-full p-4 pb-10 bg-gray-100">
  <h1 class="font-bold text-3xl">Guess Word!</h1>
  <code class="block mb-6 text-xs px-1 text-gray-300">Game: {info._id}</code>
  <div class="w-full flex justify-between">
    <b class="flex items-center"><AIcon path={mdiBookOutline} class="mr-1" />{info.bookName}</b>
    <code class="flex items-center"><AIcon path={mdiClockTimeFourOutline} class="mr-1" />{time}</code>
  </div>
  <div class="w-full my-2 border rounded overflow-hidden relative">
    <input bind:value={input} onkeyup={e => submit(e)} class="w-full p-2" placeholder="Enter your guess here!">
  </div>
  <div>
    {#snippet item(l)}
      <div class="flex items-center justify-between p-2 rounded relative bg-white overflow-hidden my-2 {l === last ? 'font-bold ring ring-gray-700' : ' '}">
        <div class="absolute left-0 top-0 bottom-0 {l.color}" style:width={l.score + '%'}></div>
        <div class="z-10">{l.word}</div>
        <div class="z-10 text-sm text-gray-500">{l.score.toFixed(2)}</div>
      </div>
    {/snippet}
    {#if last}
      {@render item(last)}
    {/if}
    <p class="text-gray-500">The score (out of 100) represents correlation between your guess and the answer.</p>
    <hr class="my-2">
    {#each list as l}
      {@render item(l)}
    {/each}
  </div>
</div>
