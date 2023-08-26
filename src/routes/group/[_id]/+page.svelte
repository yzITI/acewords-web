<script>
  import { goto } from '$app/navigation'
  import { mdiAccountGroupOutline, mdiAccountOutline, mdiCheck, mdiTrashCanOutline } from '@mdi/js'
  import { AIcon } from 'ace.svelte'
  import { loading } from '$lib/stores.js'
  import srpc from '$lib/srpc.js'
  import swal from 'sweetalert2'
  export let data
  let group = {}

  async function fetch () {
    $loading = 'Loading group ...'
    group = await srpc.group.get(data.user.token, data._id)
    if (!group) { // join
      // join
      const res = await srpc.group.join(data.user.token, data._id)
      if (!res) {
        await swal.fire('小组不存在', '', 'error')
        goto('/group')
        return $loading = false
      }
      group = await srpc.group.get(data.user.token, data._id)
    }
    group.users.sort((a, b) => a.name < b.name ? 1 : -1)
    $loading = false
  }

  if (!data.user) goto('/')
  else fetch()

  function removeUser (i) {
    group.users.splice(i, 1)
    group = group
  }

  async function submit () {
    $loading = 'Updating ...'
    const users = group.users.map(x => x._id)
    await srpc.group.put(data.user.token, data._id, {
      admin: group.admin,
      name: group.name,
      users
    })
    await swal.fire('Success', 'Group updated successfully', 'success')
    $loading = false
  }

  async function remove () {
    const { isConfirmed } = await swal.fire({
      title: '危险操作',
      html: `您正在解散并删除该小组！`,
      icon: 'warning',
      showCancelButton: true
    })
    if (!isConfirmed) return
    $loading = 'Deleting ...'
    await srpc.group.del(data.user.token, data._id)
    await swal.fire('Success', 'Group deleted successfully', 'success')
    $loading = false
    goto('/group')
  }
</script>

<div class="min-h-screen w-screen px-4 sm:px-10 py-10 bg-gray-100">
  {#if group?._id}
    <h1 class="text-2xl font-bold flex items-center">
      <AIcon path={mdiAccountGroupOutline} size="2rem" />
      <input class="bg-transparent border-none outline-none ml-2 w-full" bind:value={group.name} disabled={group.admin !== data.user.id}>
    </h1>
    <div class="m-4">
      {#each group.users as u, i}
        <div class="rounded p-2 my-2 transition-all shadow hover:shadow-md flex items-center bg-white">
          <AIcon path={mdiAccountOutline} size="1.5rem" color="rgb(55 65 81)" />
          <span class="ml-2">{u.name}</span>
          {#if group.admin === data.user.id && u._id !== data.user.id}
            <button class="ml-2" on:click={() => removeUser(i)} on:keypress={() => removeUser(i)}>
              <AIcon path={mdiTrashCanOutline} size="1.25rem" color="rgb(252 165 165)" />
            </button>
          {/if}
        </div>
      {/each}
    </div>
    {#if group.admin === data.user.id}
      <button class="fixed right-6 bottom-10 rounded-full p-3 bg-blue-500 shadow transition-all hover:shadow-md" on:click={submit} on:keypress={submit}>
        <AIcon path={mdiCheck} size="2rem" color="white" />
      </button>
      <button class="fixed top-2 right-2" on:click={remove} on:keypress={remove}>
        <AIcon path={mdiTrashCanOutline} size="1.5rem" color="rgb(252 165 165)" />
      </button>
    {/if}
  {/if}
</div>
