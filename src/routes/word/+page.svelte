<script>
  import srpc from '$lib/srpc.js'
  import swal from 'sweetalert2'
  let id = 'en.abandon'
  let show = false
  const current = {
    word: 'abandon',
    phonetic: `ә'bændәn`,
    definition: [
      'n. the trait of lacking restraint or control; reckless freedom from inhibition or worry',
      'v. forsake, leave behind',
      'v. give up with the intent of never claiming again',
      'v. stop maintaining or insisting on; of ideas or claims'
    ],
    translation: ['vt. 放弃, 抛弃, 遗弃, 使屈从, 沉溺, 放纵', 'n. 放任, 无拘束, 狂热'],
    exchange: ['d:abandoned', 'p:abandoned', 'i:abandoning', '3:abandons']
  }
</script>

<div class="h-screen w-screen px-4 py-16 bg-gray-100 flex flex-col items-center justify-between">
  <div class="flex flex-col items-center w-full" style="max-width: 360px;">
    <h2 class="text-5xl font-bold">{current.word}</h2>
    <p class="italic text-gray-700">{current.phonetic}</p>
    <div class={'w-full border bg-white rounded p-2 my-6 transition-all ' + (show ? 'opacity-100' : 'opacity-0')}>
      {#each current.translation as t}
        <p class="m-1">{t}</p>
      {/each}
    </div>
  </div>
  <div class="flex items-center justify-between my-4 font-bold text-lg w-full" style="max-width: 400px;">
    {#if show}
      <button class="transition-all shadow hover:shadow-md rounded w-1/2 p-2 bg-red-500 text-white mx-2">不认识</button>
      <button class="transition-all shadow hover:shadow-md rounded w-1/2 p-2 bg-green-500 text-white mx-2">认识</button>
    {:else}
      <button on:click={() => show = true} class="transition-all shadow hover:shadow-md rounded w-full p-2 bg-blue-500 text-white">查看释义</button>
    {/if}
  </div>
</div>