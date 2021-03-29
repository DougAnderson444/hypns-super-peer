<script>
  import { onMount } from "svelte";
  let pins;
  onMount(() => {
    const sse = new EventSource(`/feed`);
    sse.onmessage = (event) => {
      let response = JSON.parse(event.data);
      console.log(`msg rxd: `, { response });
      if (!response) return;
      pins = response;
    };

    return () => {
      if (sse.readyState === 1) {
        sse.close();
      }
    };
  });
</script>

<main>
  <h1>A list of pinned Public Keys</h1>
  {#if pins}
    {#key pins}
      <br />Last update:
      {new Date(Date.now()).toLocaleString()}
      <!-- destroyed and recreated whenever `pins` changes Object.entries -->
      {#each Object.entries(pins) as [key, value]}
        <li>{key} {value ? JSON.stringify(value) : "Pending"}</li>
      {/each}
    {/key}
  {:else}...loading{/if}
</main>

<style>
  main {
    text-align: left;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }

  h1 {
    color: #2ec73d;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>
