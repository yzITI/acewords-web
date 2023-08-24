<script>
  import srpc from '$lib/srpc.js'
  import swal from 'sweetalert2'
  let id = 'en.abandon'
  let show = false
  const data = {
    'en.abandon': {
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
  }
</script>

<div class="min-h-screen w-screen px-4 sm:px-10 py-16 bg-gray-100 flex flex-col items-center">
  <div class="text-8xl font-bold my-4">{data[id].word}</div>
  <div class="text-2xl italic my-4">{data[id].phonetic}</div>
  <div class="w-4/5">
    <div class="w-full transition-all hover:bg-gray-200 text-gray-500 rounded text-center px-2 py-1" on:click={() => { show = !show }}>{show ? '收起释义' : '展开释义'}</div>
    {#if show}
      <div class="w-full rounded bg-white my-4 px-8 py-4">
        <div class="text-2xl">定义</div>
        {#each data[id].definition as text}
          <div class="my-1 mx-2">{text}</div>
        {/each}
      </div>
      <div class="w-full rounded bg-white my-4 px-8 py-4">
        <div class="text-2xl">翻译</div>
        {#each data[id].translation as text}
          <div class="my-1 mx-2">{text}</div>
        {/each}
      </div>
      <div class="w-full rounded bg-white my-4 px-8 py-4">
        <div class="text-2xl">变形</div>
        <div class="flex flex-wrap whitespace-nowrap">
          {#each data[id].exchange as text}
            <div class="m-1">{text}</div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
  <div class="flex items-center text-4xl my-4 font-bold">
    <button class="rounded-lg shadow bg-gray-200 text-gray-500 px-8 py-4 m-4">不认识</button>
    <button class="rounded-lg shadow bg-green-500 text-white px-8 py-4 m-4">认识</button>
  </div>
</div>