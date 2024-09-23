<script>
  import logo from '$lib/images/logo.svg'
  import { goto } from '$app/navigation'
  function signin () {
    window.location.href = 'https://auth.njsc.ltd/#/launch/acewords'
  }
</script>

<div class="h-screen w-full flex flex-col items-center justify-center">
  <img alt="logo" class="w-48 sm:w-64" src={logo}>
  <h1 class="text-gray-700 font-bold text-5xl">Acewords</h1>
  <p class="text-gray-500">in a simple but powerful way</p>
  <div>
    <button class="font-bold text-lg text-white px-4 py-2 rounded shadow transition-all hover:shadow-md bg-blue-500 my-8 mx-2" onclick={signin}>Sign in</button>
    <button class="font-bold text-lg text-white px-4 py-2 rounded shadow transition-all hover:shadow-md bg-purple-500 my-8 mx-2" onclick={() => goto('/guess')}>G'aceWord!</button>
  </div>
  <p class="opacity-50 fixed right-1 bottom-1 text-sm">dedicated to 🍊</p>
</div>
