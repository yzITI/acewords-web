<script>
  import '../index.css'
  import loadingImg from '$lib/images/loading.svg'
  import { loading } from '$lib/stores.js'
  import { fade } from 'svelte/transition'
</script>

<svelte:head>
  <title>Acewords</title>
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
  <link rel="manifest" href="/site.webmanifest">
  <meta name="msapplication-TileColor" content="#ffffff">
  <meta name="theme-color" content="#4980e9">
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
