<script>
  import { goto } from '$app/navigation'
  import { mdiBookOutline, mdiAccountGroupOutline, mdiLogout } from '@mdi/js'
  import { AIcon } from 'ace.svelte'
  import { loading } from '$lib/stores.js'
  import srpc from '$lib/srpc.js'
  import swal from 'sweetalert2'
  import model from '$lib/model.js'
  export let data
  
  const LS = window.localStorage
  let meta = JSON.parse(LS.meta || '{}')

  async function sync () {
    $loading = 'Sync your progress ...'
    const remote = await srpc.user.getMeta(data.user.token)
    const local = JSON.parse(LS.meta || '{}')
    if (remote.time > local.time) { // update local
      const full = await srpc.user.get(data.user.token)
      await model.import(full.data)
      LS.meta = JSON.stringify(full.meta)
      meta = remote
    }
    if (remote.time < local.time) { // update remote
      await srpc.user.put(token, await model.export(), local)
      meta = local
    }
    $loading = false
  }

  function signout () {
    window.localStorage.removeItem('token')
    goto('/')
  }

  if (!data.user) goto('/')
  else sync()
</script>

<div class="h-screen w-screen px-4 sm:px-10 py-10 bg-gray-100">
  <h1 class="text-3xl">Hi, {data.user.name}</h1>
  <p class="text-gray-500 text-sm">Ace your words in a simple but powerful way!</p>
  <div class="my-4 text-xl font-bold text-gray-700 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 select-none">
    <div class="rounded p-4 m-4 transition-all shadow hover:shadow-md cursor-pointer flex items-center bg-blue-500 text-white">
      <AIcon path={mdiBookOutline} size="2rem" color="white" />
      <span class="ml-2">开始背单词！</span>
    </div>
    <div class="rounded p-4 m-4 transition-all shadow hover:shadow-md cursor-pointer flex items-center bg-white" on:keypress={() => goto('/group')} on:click={() => goto('/group')}>
      <AIcon path={mdiAccountGroupOutline} size="2rem" color="rgb(55 65 81)" />
      <span class="ml-2">我的小组</span>
    </div>
  </div>
  <button class="mt-2 mb-10 flex items-center text-gray-500 font-bold" on:click={signout} on:keypress={signout}>
    <AIcon path={mdiLogout} size="1.5rem" color="rgb(107 114 128)" />
    <span class="ml-1">Sign out</span>
  </button>
</div>
