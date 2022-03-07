<script>
	import TextInput from "./TextInput.svelte";
	import cipherList from "./calc/ciphers";
	("./calc/ciphers");
	import { each } from "svelte/internal";
	export let name;
	let text = "";
	let selectedCipher = 60
	$: currentCipher = cipherList[selectedCipher]

	const cycleCipher = () => {
		if (selectedCipher < cipherList.length - 1 ) {
			selectedCipher+= 1;
		} else {
			selectedCipher = 0;
		}
		
		console.log(selectedCipher)
	}

	const valueOf = (c) => {
		console.log("character is ", c, c.charCodeAt(0));
		console.log(currentCipher.vArr);
		const val = currentCipher.vArr[currentCipher.cArr.indexOf(c.charCodeAt(0))] || 0;
		console.log("value of ", c, " is ", val);
		return val;
	};

	const decode = (t) => {
		let decoded = "";
		console.log("decoding", t);
		let val = 0;
		let combinedValue = 0;
		for (const c of t) {
			if (c != " ") {
				decoded += c;
				val += valueOf(c);
				combinedValue += val;
			} else {
				decoded += " " + val + " ";
				val = 0;
			}
			//decoded += val;
		}
		return decoded + " " + val + "  (" + combinedValue + ")";
	};
</script>

<!-- {"cipherName":"English Ordinal",
"cipherCategory":"English",
"H":120,"S":65,"L":62,
"cArr":[97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122],
"vArr":[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26],
"diacriticsAsRegular":true,
"caseSensitive":false,"enabled":true,"cp":[],"cv":[],"sumArr":[]} -->
<main>
	<header>
		Current Cipher: {currentCipher.cipherName}
		<button on:click={cycleCipher}>Next Cipher</button>
	</header>
	<h1>Welcome to {name}!</h1>
	<TextInput label="Text to decode" bind:value={text} multiline={true} />
<!-- 	<p>{text}</p>
	<p>
		{JSON.stringify(currentCipher)}
	</p> -->
	{#key selectedCipher}
	<p>
		{@html decode(text.toLocaleLowerCase())}
	</p>
	{/key}
	<!-- 	{#each cipherList as c}
	<p>{JSON.stringify(c)}</p>
	{/each} -->
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
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
