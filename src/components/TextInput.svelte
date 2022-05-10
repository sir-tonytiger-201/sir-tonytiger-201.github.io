<script>
  //import { shortcut } from '../js/shortcut'
  import { scale } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import { flip } from "svelte/animate";
  export let label;
  export let value;
  export let multiline = false;
  export let shortcut;
  let focused = false;
</script>

<label for="">
  <span>{label}</span>
  {#if multiline}
  
    <textarea
      autofocus
      bind:value
      placeholder="Type or paste text here.

Left-click to expand/contract. Window will automatically contract when mouse moves outside.

The Tab key will cycle through ciphers, or use arrow buttons."
      transition:scale={{ duration: 1000, easing: cubicOut }}
      on:click={() => (focused = !focused)}
      spellcheck={false}
      on:mouseleave={() => (focused = false)}
      class:focused 
      style="padding: 1em;"
    />

  {:else}
    <input type="text" bind:value />
  {/if}
</label>

<style>
  label {
    font-weight: var(--typeWeightBold);
    text-transform: uppercase;
  }
  span {
    padding: 0 0 var(--spacingSmall) var(--spacingLarge);
  }
  textarea {
    display: block;
    background: #f8ecde;
    border-radius: 25px;
    border: 2px solid var(--colorFg);
    padding: 10em;
    width: 100%;
    margin: 0px;
    box-shadow: 10px 10px 20px rgb(224, 93, 174);
    padding: 10em;
    height: 9rem;

  }

  .focused {
    height: 30em;
  }
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
</style>
