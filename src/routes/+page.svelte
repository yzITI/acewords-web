<script>
  import logo from '$lib/images/logo.svg'
  function signin () {
    window.location.href = 'https://auth.njsc.ltd/#/launch/acewords'
  }
</script>

<div class="h-screen w-screen flex flex-col items-center justify-center">
  <img alt="logo" class="w-48 sm:w-64" src={logo}>
  <h1 class="text-gray-700 font-bold text-5xl">Acewords</h1>
  <p class="text-gray-500">in a simple but powerful way</p>
  <button class="font-bold text-lg text-white px-4 py-2 rounded shadow transition-all hover:shadow-md bg-blue-500 m-8" on:click={signin}>Sign in</button>
  <p class="opacity-50 fixed right-1 bottom-1 text-sm">dedicated to 🍊</p>
</div>
