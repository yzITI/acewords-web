
<script>
  import { goto } from '$app/navigation'
  import srpc from '$lib/srpc.js'
  import swal from 'sweetalert2'
  import { S, LS, SS } from '$lib/S.svelte'
  let input = $state('')
  let info = $state({ _id: 'loading' })
  let list = $state([])
  let last = $state(null)
  async function init () {
    S.loading = true
    info = await srpc.guess.get()
    S.loading = false
  }
  init()
  async function submit (e) {
    if (e.key !== 'Enter' || !input.match(/\S/)) return
    const word = input = input.toLowerCase()
    const d = await srpc.guess.try(word)
    input = ''
    if (d < 0) return swal.fire('Unknown Word', 'The word you guessed is out of range!', 'error')
    last = { word, dist: d }
    last.score = 100 - Math.max(0, d - 0.25) / 0.25 * 100
    if (last.dist <= 0) last.color = 'bg-green-300'
    else if (last.score > 80) last.color = 'bg-blue-300'
    else if (last.score > 50) last.color = 'bg-amber-300'
    else if (last.score > 20) last.color = 'bg-orange-300'
    else last.color = 'bg-red-300'
    list.push(last)
    list.sort((a, b) => a.dist - b.dist)
  }
</script>

<div class="h-screen w-screen p-4 bg-gray-100">
  <h1 class="font-bold text-3xl">Guess Word!</h1>
  <p class="mb-6 text-xs px-1 text-gray-300">Game: {info._id}</p>
  <div class="w-full my-2 border rounded overflow-hidden relative">
    <input bind:value={input} onkeyup={e => submit(e)} class="w-full p-2" placeholder="Enter your guess!">
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
    <hr class="my-2">
    {#each list as l}
      {@render item(l)}
    {/each}
  </div>
</div>
