<script>
  import { goto } from '$app/navigation'
  import { mdiAccountGroupOutline, mdiPlus } from '@mdi/js'
  import { AIcon } from 'ace.svelte'
  import { loading } from '$lib/stores.js'
  import srpc from '$lib/utilities/srpc.js'
  import swal from 'sweetalert2'
  export let data
  let groups = []

  async function fetch () {
    $loading = true
    groups = await srpc.group.getList(data.user.token)
    groups.sort((a, b) => a.name > b.name ? 1 : -1)
    groups = groups
    $loading = false
  }

  async function create () {
    $loading = true
    const _id = await srpc.group.add(data.user.token)
    if (!_id) return swal.fire('Error', 'Fail to create group', 'error')
    groups.push({ _id, name: 'New Group' })
    groups.sort((a, b) => a.name > b.name ? 1 : -1)
    groups = groups
    $loading = false
    return swal.fire('Success', 'You have created a new group!', 'success')
  }

  if (!data.user) goto('/')
  else fetch()
</script>

<div class="h-screen w-screen px-4 sm:px-10 py-10 bg-gray-100">
  <h1 class="text-3xl">我的小组</h1>
  <p class="text-gray-500 text-sm">和朋友们一起背单词吧！</p>
  <div class="mt-6 text-lg font-bold text-gray-700 select-none">
    {#each groups as g}
      <div class="rounded p-2 my-2 transition-all shadow hover:shadow-md cursor-pointer flex items-center bg-white" on:click={() => goto('/group/' + g._id)}>
        <AIcon path={mdiAccountGroupOutline} size="1.5rem" color="rgb(55 65 81)" />
        <span class="ml-2">{g.name}</span>
      </div>
    {/each}
    {#if !groups?.length}
      <div class="rounded p-2 my-2 transition-all shadow hover:shadow-md flex items-center bg-white text-gray-500 font-normal">
        <span class="ml-2">你还没有小组噢，创建或加入一个吧！</span>
      </div>
    {/if}
    <button class="fixed right-6 bottom-10 rounded-full p-2 bg-blue-500 shadow transition-all hover:shadow-md" on:click={create}>
      <AIcon path={mdiPlus} size="3rem" color="white" />
    </button>
  </div>
</div>
