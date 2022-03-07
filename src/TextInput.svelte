<script>
  export let label;
  export let value;
  export let multiline = false;
</script>

<label for="" >
  <span>{label}</span>
  {#if multiline}
    <textarea bind:value />
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
  input, textarea {
    display: block;
    background: #f8ecde;
    border-radius: 25px;
    border: 2px solid var(--colorFg);
    padding: 1rem;
    width: 100%;
    margin: 0px;
    box-shadow: 10px 10px 20px  rgb(224, 93, 174);
    
  }
  textarea {
    height: 8rem;
  }
</style>
