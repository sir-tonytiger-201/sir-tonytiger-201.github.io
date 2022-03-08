<script>
  const triangular = (number) => {
    const abs = Math.abs(number);
    return (abs / 2) * (abs + 1) * (abs / number) || 0;
  };

  export let triangularHighlight = {}
  const numbers = 50;
  let numberArray = [];
  for (let index = 1; index < numbers; index++) {
    const triangleNum = triangular(index)
    numberArray.push(triangleNum);
    triangularHighlight[triangleNum] = true;
  }
  let number='';

    const toggleHighlight = num => {
    triangularHighlight[num] = !triangularHighlight[num]
  }
  
</script>

<div class="numberbar">
  <div>Triangular Numbers 
    <button on:click={() => {
    for (const val in triangularHighlight) {triangularHighlight[val] = false}
  }}>clear</button>
  <button on:click={() => {
    for (const val in triangularHighlight) {triangularHighlight[val] = true}
  }}>select all</button>
   
  </div>
  {#each numberArray as triangularNumber, i}
    <span>
      <a href="" bind:innerHTML={triangularNumber} contenteditable 
      class:triangularhighlight={triangularHighlight[triangularNumber]}
      on:click|preventDefault={() => toggleHighlight(triangularNumber)}>
        {triangularNumber} &nbsp;
      </a>
      </span>
  {/each}
</div>

<style>
  a {
    cursor: pointer;
  }
  .numberbar {
    margin: 0px;
    width: 100%;
    background-color: lightblue;
    
    }

    .triangularhighlight {
		color: yellow;
		background-color: red;
		font-style: italic;
		font-weight: bold;
	}
</style>
