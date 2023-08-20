<script>
  import SmileIcon from '$lib/components/SmileIcon.svelte'
  let cot = 0

  function inc () {
    cot++
  }
</script>

<SmileIcon></SmileIcon>
<p>cot: {cot}</p>
<button on:click={inc}>Click Me</button>
