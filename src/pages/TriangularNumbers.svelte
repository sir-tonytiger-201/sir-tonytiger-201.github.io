<script>
  import { triangularNumbers } from "../js/store";
  let triangleArray = [];
  const triangular = (number) => {
    const abs = Math.abs(number);
    return (abs / 2) * (abs + 1) * (abs / number) || 0;
  };

  export let triangularHighlight = {}
  const numbers = 50;
  
  for (let index = 1; index < numbers; index++) {
    const triangleNum = triangular(index)
    triangleArray.push(triangleNum);
    triangularHighlight[triangleNum] = true;
  }


  let number='';

    const toggleHighlight = num => {
    triangularHighlight[num] = !triangularHighlight[num]
  }

  triangularNumbers.set(triangleArray)
  
</script>

<div class="numberbar">
  <div> Triangular Numbers 
    <button on:click={() => {
    for (const val in triangularHighlight) {triangularHighlight[val] = false}
  }}>clear</button>
  <button on:click={() => {
    for (const val in triangularHighlight) {triangularHighlight[val] = true}
  }}>select all</button>
   
  </div>
  <table>
    <thead>
      <tr>
        {#each triangleArray as triangularNumber, i}
          <td>{i+1}</td>
        {/each}
      

</tr>
  {#each triangleArray as triangularNumber, i}
  <td>
    <a href="" bind:innerHTML={triangularNumber} contenteditable 
    class:triangularhighlight={triangularHighlight[triangularNumber]}
    on:click|preventDefault={() => toggleHighlight(triangularNumber)}>
      {triangularNumber} &nbsp;
    </a>
    </td>
{/each}
</thead>
</table>
</div>

<style lang="postcss">
  a {
    cursor: pointer;
  }
  .numberbar {
    margin: 0px;
    width: 100%;
    background-color: lightblue;
    border-top-left-radius: 1em;
    border-top-right-radius: 1em;
    }

    .triangularhighlight {
		color: yellow;
		background-color: red;
		font-style: italic;
		font-weight: bold;
	}

  table, td {
    border-style: solid;
    text-align: center;
    border-collapse: collapse;
    padding: 0.5vh;
  }

  

</style>
