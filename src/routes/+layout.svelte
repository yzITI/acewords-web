<script>
  import '../index.css'
  import loadingImg from '$lib/images/loading.svg'
  import { loading } from '$lib/stores.js'
  import { fade } from 'svelte/transition'
</script>

<svelte:head>
  <title>Acewords</title> 
</svelte:head>

<slot></slot>

{#if $loading}
  <div transition:fade class="fixed z-50 top-0 left-0 w-screen h-screen bg-gray-100 flex items-center justify-center">
    <img alt="loading" src={loadingImg}>
  </div>
{/if}
