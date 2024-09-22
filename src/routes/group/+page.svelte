<script>
  import { goto } from '$app/navigation'
  import { mdiAccountGroupOutline, mdiPlus, mdiChevronLeft } from '@mdi/js'
  import { AIcon } from 'ace.svelte'
  import { fade } from 'svelte/transition'
  import { S } from '$lib/S.svelte'
  import srpc from '$lib/srpc.js'
  import swal from 'sweetalert2'
  let { data } = $props()
  let fetching = $state(false)

  async function fetch () {
    fetching = true
    S.groups = await srpc.group.getList(data.user.token)
    S.groups.sort((a, b) => a.name > b.name ? 1 : -1)
    fetching = false
  }

  async function create () {
    S.loading = true
    const _id = await srpc.group.add(data.user.token)
    if (!_id) return swal.fire('Error', 'Fail to create group', 'error')
    S.groups.push({ _id, name: 'New Group' })
    S.groups.sort((a, b) => a.name > b.name ? 1 : -1)
    S.loading = false
    return swal.fire('Success', 'You have created a new group!', 'success')
  }

  if (!data.user) goto('/')
  else fetch()
</script>

<div class="min-h-screen w-full px-4 sm:px-10 py-10 bg-gray-100">
  <h1 class="text-2xl font-bold flex items-center select-none">
    <button class="transition-all pl-2 hover:pr-2 hover:pl-0" onclick={() => goto('/home')}><AIcon path={mdiChevronLeft} size="2.5rem" /></button>
    <span class="text-3xl">我的小组</span>
  </h1>
  <p class="text-gray-400 text-sm ml-12">和朋友们一起背单词吧！</p>
  <div class="mt-6 text-lg font-bold text-gray-700 select-none">
    {#each S.groups as g}
      <div class="rounded p-3 my-2 transition-all shadow hover:shadow-md cursor-pointer flex items-center bg-white" onkeypress={() => goto('/group/' + g._id)} onclick={() => goto('/group/' + g._id)}>
        <AIcon path={mdiAccountGroupOutline} size="1.5rem" color="rgb(55 65 81)" />
        <span class="ml-2">{g.name}</span>
      </div>
    {/each}
    {#if !S.groups?.length && !fetching}
      <div class="rounded p-3 my-2 transition-all shadow hover:shadow-md flex items-center bg-white text-gray-500 font-normal">
        <span class="ml-2">你还没有小组噢，创建或加入一个吧！</span>
      </div>
    {/if}
    {#if fetching}
      <p transition:fade>正在载入...</p>
    {/if}
    <button class="fixed right-6 bottom-10 rounded-full p-2 bg-blue-500 shadow transition-all hover:shadow-md" onclick={create} onkeypress={create}>
      <AIcon path={mdiPlus} size="3rem" color="white" />
    </button>
  </div>
</div>
