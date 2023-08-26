<script>
  import '../index.css'
  import loadingImg from '$lib/images/loading.svg'
  import { loading } from '$lib/stores.js'
  import { fade } from 'svelte/transition'
  function touchevent () {
    const audio = new Audio('https://dict.youdao.com/dictvoice?audio=hello&type=1')
    audio.play()
    setTimeout(() => {
      audio.pause()
      document.removeEventListener('touchstart', touchevent)
    })
  }
  document.addEventListener('touchstart', touchevent)
</script>

<svelte:head>
  <title>Acewords</title> 
</svelte:head>

<slot></slot>

{#if $loading}
  <div transition:fade class="fixed z-50 top-0 left-0 w-screen h-screen bg-gray-100 flex flex-col items-center justify-center">
    <img alt="loading" src={loadingImg}>
    {#if typeof $loading === 'string'}
      <div class="my-2">{$loading}</div>
    {/if}
  </div>
{/if}
