<script>
  import { fibonacciNumbers } from "../js/store";
  let fibonacciArray = [];
  export let fibonacciHighlight = {};

  $fibonacciNumbers.forEach((m) => {
    fibonacciArray.push(m);
    fibonacciHighlight[m] = false;
  });

  const toggleHighlight = (num) => {
    fibonacciHighlight[num] = !fibonacciHighlight[num];
  };
</script>

<div class="numberbar">
  <div>
    Fibonnaci Numbers
    <button
      on:click={() => {
        for (const val in fibonacciHighlight) {
          fibonacciHighlight[val] = false;
        }
      }}>clear</button
    >
    <button
      on:click={() => {
        for (const val in fibonacciHighlight) {
          fibonacciHighlight[val] = true;
        }
      }}>select all</button
    >
  </div>
  <table>
    <thead>
      <tr>
        {#each $fibonacciNumbers as fibonacciNumber, i}
          <td>{i + 1}</td>
        {/each}
      </tr>
      {#each $fibonacciNumbers as triangularNumber, i}
        <td>
          <a
            href="#"
            bind:innerHTML={triangularNumber}
            contenteditable
            class:fibonacciHighlight={fibonacciHighlight[triangularNumber]}
            on:click|preventDefault={() => toggleHighlight(triangularNumber)}
          >
            {triangularNumber} &nbsp;
          </a>
        </td>
      {/each}
    </thead>
  </table>
</div>

<style>
  a {
    cursor: pointer;
  }
  .numberbar {
    margin: 0px;
    width: 100%;
    background-color: lightblue;
    /* border-top-left-radius: 1em;
    border-top-right-radius: 1em; */
  }

  .fibonacciHighlight {
    color: yellow;
    background-color: red;
    font-style: italic;
    font-weight: bold;
  }

  table,
  td {
    border-style: solid;
    text-align: center;
    border-collapse: collapse;
    padding: 0.5vh;
  }
</style>
