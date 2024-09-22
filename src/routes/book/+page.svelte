<script>
  import { goto } from '$app/navigation'
  import { mdiBookOutline } from '@mdi/js'
  import { AIcon } from 'ace.svelte'
  import { S, LS } from '$lib/S.svelte'
  import srpc from '$lib/srpc.js'
  import swal from 'sweetalert2'
  let { data } = $props()
  let books = $state([])

  async function fetch () {
    S.loading = 'Loading books ...'
    books = await srpc.book.getList()
    books.sort((a, b) => a.name > b.name ? 1 : -1)
    S.loading = false
  }

  async function choose (b) {
    const { isConfirmed } = await swal.fire({
      title: '确认选择',
      html: `<b>${b.name}</b><br><b style="color: red;">您此前的记录将被清除</b>`,
      icon: 'question',
      showCancelButton: true
    })
    if (!isConfirmed) return
    S.loading = true
    const meta = { // new meta
      time: Date.now(),
      power: 0,
      book: b._id,
      bookName: b.name,
      bookCount: b.count
    }
    await srpc.user.put(data.user.token, '', meta) // Clear record in cloud, will be imported back to /home
    LS.removeItem('statistics') // clear statistics
    S.loading = false
    await swal.fire('选择成功', `您已选择${b.name}`, 'success')
    goto('/home')
  }

  if (!data.user) goto('/')
  else fetch()
</script>

<div class="min-h-screen w-full px-4 sm:px-10 py-10 bg-gray-100">
  <h1 class="text-3xl">选择单词书</h1>
  <p class="text-gray-500 text-sm">您的背单词记录将被清除</p>
  <div class="mt-6 text-lg font-bold text-gray-700 select-none">
    {#each books as b}
      <div class="rounded p-2 my-2 transition-all shadow hover:shadow-md cursor-pointer flex items-center bg-white" onkeypress={() => choose(b)} onclick={() => choose(b)}>
        <AIcon path={mdiBookOutline} size="1.5rem" color="rgb(55 65 81)" />
        <span class="ml-2">{b.name}</span>
        <code class="bg-blue-100 text-blue-500 ml-2 text-xs rounded p-1">{b.count}</code>
      </div>
    {/each}
  </div>
</div>
