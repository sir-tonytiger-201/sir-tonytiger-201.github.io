<script>
	import TextInput from "../components/TextInput.svelte";
	import cipherList from "../calc/ciphers";
	import { shortcut } from "../js/shortcut";
	import TriangularNumbers from "./TriangularNumbers.svelte";
	import { scale } from "svelte/transition";
	import { cubicOut } from "svelte/easing";
	let text = "";
	let selectedCipher = 0;
	let selected = 0;
	let triangularHighlight = {};
	let quickWord = '';
	const params = {
		ignoreTrivial: false,
		onlyShowHighlighted: false,
		showValues: true,
	};

	let showValues = false;
	let numberLookup = "";
	let numberSearch = "";
	$: specialNumbers = [33, 38, 42, 47, 48, 74, 83, 84, 120, 137, 201];
	const numberInfo = {
		33: "https://www.reddit.com/r/GeometersOfHistory/wiki/spellcomponents/33",
		42: "https://www.reddit.com/r/GeometersOfHistory/wiki/spellcomponents/42",
		47: "https://www.reddit.com/r/GeometersOfHistory/wiki/spellcomponents/47",
		74: "https://www.reddit.com/r/GeometersOfHistory/wiki/spellcomponents/74",
		83: "https://www.reddit.com/r/GeometersOfHistory/wiki/spellcomponents/83",
		120: "https://www.reddit.com/r/GeometersOfHistory/wiki/spellcomponents/120",
		137: "https://www.reddit.com/r/GeometersOfHistory/wiki/spellcomponents/137",
		201: "https://www.reddit.com/r/GeometersOfHistory/wiki/spellcomponents/201",
	};

	const trivialList = ["a", "is", "or", "of", "if", "at", "the", "also"];

	const addToHighlights = (num) => {
		if (!specialNumbers.includes(num)) {
			specialNumbers = [...specialNumbers, Number(num)];
			triangularHighlight = triangularHighlight;
			console.log(specialNumbers);
		}
	};

	
	$: currentCipher = cipherList[selectedCipher];
	$: cipherString = () => {
		if (!currentCipher) return "";
		let letterValues = {};
		for (const c of currentCipher.cArr) {
			const letter = String.fromCharCode(c);
			const val = currentCipher.vArr[currentCipher.cArr.indexOf(c)];
			letterValues[letter] = val;
		}
		return JSON.stringify(letterValues);
	};

	const toggleAndUpdate = (key) => {
		params[key] = !params[key];
		triangularHighlight = triangularHighlight;
	};

	const displayCipher = () => {
		let letterValues = {};
		for (const c of currentCipher.cArr) {
			const letter = String.fromCharCode(c);
			const val = currentCipher.vArr[currentCipher.cArr.indexOf(c)];
			letterValues[letter] = val;
		}
		let values = "";

		console.log(letterValues);
		//console.log(JSON.stringify(letterValues, (key,value) => key + ": " + value , ''));
		alert(
			JSON.stringify(letterValues, null, "") + JSON.stringify(currentCipher)
		);
	};

	const cycleBackward = () => {
		if (selectedCipher > 0) {
			selectedCipher -= 1;
		} else {
			selectedCipher = cipherList.length - 1;
		}
	};
	const cycleForward = () => {
		if (selectedCipher < cipherList.length - 1) {
			selectedCipher += 1;
		} else {
			selectedCipher = 0;
		}
	};

	const valueOf = (c) => {
		//console.log("character is ", c, c.charCodeAt(0));
		//console.log(currentCipher.vArr);
		const val =
			currentCipher.vArr[currentCipher.cArr.indexOf(c.charCodeAt(0))] || 0;
		//console.log("value of ", c, " is ", val);
		return val;
	};

	const evalWord = (word) => {
		let val = 0;
		for (const c of word.toLocaleLowerCase()) {
			val += valueOf(c);
		}
		return val;
	};

	const simplify = (word) => {
		if (typeof word !== "string") return word;
		let simplified = "";
		//console.log("word = ", word)
		for (const c of word) {
			if (currentCipher.vArr[currentCipher.cArr.indexOf(c.charCodeAt(0))]) {
				simplified += c;
			}
		}
		if (word !== simplified) {
			//console.log(word," simplified is ", simplified)
		}

		return simplified;
	};

	$: if( selectedCipher) {
		quickDecode = evalWord(quickWord)
	}


	const highlight = (text) => {
		const [word, value] =
			typeof text === "string" ? text.split(" ") : [text, null];
		if (!params.showValues) text = word;
		if (
			params.ignoreTrivial &&
			(trivialList.includes(simplify(word)) || simplify(word).length < 4)
		) {
			return params.onlyShowHighlighted ? "" : text;
		} else {
			if (numberInfo[value]) {
				return `<a href='${numberInfo[value]}' class='highlight' target="_blank">${text}</a>`;
			} else {
				return "<span class='highlight'>" + text + "</span>";
			}
		}
	};

	const triangleHighlight = (text) => {
		const word = text.split(" ")[0];
		if (!params.showValues) text = word;
		if (
			params.ignoreTrivial &&
			(trivialList.includes(word) || simplify(word).length < 4)
		) {
			return params.onlyShowHighlighted ? "" : text;
		} else {
			return "<span class='triangle-highlight'>" + text + "</span>";
		}
	};

	const decode = (t) => {
		let decoded = "";
		let combinedValue = { num: 0, html: "" };
		let val = 0;

		for (const line of t.split("\n")) {
			combinedValue.num = 0;
			for (const word of line.split(" ")) {
				if (!word) continue;
				val = evalWord(word);
				combinedValue.num += val;

				if (specialNumbers.includes(val)) {
					//val = highlight(val);
					const returnedValue = highlight(word + " " + val);
					if (returnedValue) {
						decoded += returnedValue + " ";
					} else {
						combinedValue.num -= val;
					}
				} else if (triangularHighlight[val] === true) {
					const returnedValue = triangleHighlight(word + " " + val);
					if (returnedValue) {
						decoded += returnedValue + " ";
					} else {
						combinedValue.num -= val;
					}
				} else {
					if (!params.onlyShowHighlighted) {
						if (params.showValues) {
							decoded += word + " " + val + " ";
						} else {
							decoded += word + " ";
						}
					} else {
						combinedValue.num -= val;
					}
				}
			}

			if (specialNumbers.includes(combinedValue.num)) {
				combinedValue.html = highlight(combinedValue.num);
			} else {
				combinedValue.html = combinedValue.num;
			}

			if (decoded.length > 0) {
				decoded +=
					combinedValue.num > 0 && params.showValues
						? "(" + combinedValue.html + ")<br><br>"
						: "<br>";
			}
		}

		return decoded;
	};

	$: quickDecode = evalWord(quickWord)

</script>

<!-- {"cipherName":"English Ordinal",
"cipherCategory":"English",
"H":120,"S":65,"L":62,
"cArr":[97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122],
"vArr":[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26],
"diacriticsAsRegular":true,
"caseSensitive":false,"enabled":true,"cp":[],"cv":[],"sumArr":[]} -->

<main>
	<div class="fixed">
		<center>
			<TriangularNumbers bind:triangularHighlight />
			<nav>
				<!-- <h1>Decoder</h1> -->
				<input
					type="text"
					bind:value={quickWord}
					
					placeholder="quick decode"
				/>
				<input type="text" readonly class="numberbox" bind:value={quickDecode} />
				<button on:click={() => (text = "")}>Clear text</button>
				<input
					type="text"
					use:shortcut={{
						code: "Enter",
						callback: () => addToHighlights(numberSearch),
					}}
					bind:value={numberSearch}
					placeholder="number search"
				/>
				<button on:click={() => addToHighlights(numberSearch)}>go</button>
				<button on:click={() => toggleAndUpdate("onlyShowHighlighted")}>
					show
					{#if params.onlyShowHighlighted} all {:else} only highlighted {/if}
				</button>
				<button on:click={() => toggleAndUpdate("showValues")}>
					{#if params.showValues} hide {:else} show {/if} values
				</button>
				<button on:click={() => toggleAndUpdate("ignoreTrivial")}>
					{#if params.ignoreTrivial} show {:else} hide {/if} trivial
				</button>
				<select
					bind:value={selectedCipher}
					use:shortcut={{ code: "Home", callback: () => (selectedCipher = 0) }}
				>
					{#each cipherList as cipher, i}
						<option value={i}>
							{i + 1}: {cipher.cipherName}
						</option>
					{/each}
				</select>
				<!-- Current Cipher: {currentCipher.cipherName} -->
				<button on:click={displayCipher}>View Cipher</button>
				<button
					on:click={cycleBackward}
					use:shortcut={{ shift: true, code: "Tab", callback: cycleBackward }}
					>Previous Cipher</button
				>
				<button
					on:click={cycleForward}
					use:shortcut={{ code: "Tab", callback: cycleForward }}
					>Next Cipher</button
				>
				<input
					type="text"
					bind:value={numberLookup}
					class="numberbox"
					placeholder="number lookup"
				/>
				<button
					on:click={() =>
						window.open(
							`https://www.reddit.com/r/GeometersOfHistory/wiki/spellcomponents/${numberLookup}`
						)}>go</button
				>
				<button>Sorted Results</button>
			</nav>

			<TextInput
				{shortcut}
				label="Text to decode"
				bind:value={text}
				multiline={true}
			/>
			{cipherString()}
		</center>
	</div>
	<div class="decoded" transition:scale={{ duration: 1000, easing: cubicOut }}>
		<!-- 	<p>{text}</p>
	<p>
		{JSON.stringify(currentCipher)}
	</p> -->
		{#key selectedCipher}
			{#key triangularHighlight}
					{@html decode(text).replace(/<br><br>/g,'<br>')}
			{/key}
		{/key}
		<!-- 	{#each cipherList as c}
	<p>{JSON.stringify(c)}</p>
	{/each} -->
	</div>
</main>

<style>
	main {
		text-align: center;
		max-width: 240px;
		margin: 0px;
		
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 3em;
		font-weight: 100;
		margin: auto;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}

	:global(.highlight, .highlight.a:link, a:visited) {
		color: yellow;
		background-color: blue;
		font-style: italic;
		font-weight: bold;
	}

	:global(.triangle-highlight) {
		color: rgb(255, 0, 191);
		background-color: rgb(167, 196, 7);
		font-style: italic;
		font-weight: bold;
	}

	.fixed {
		margin-top: 0px;
		margin-left: auto;
		margin-right: 1.5em;
		/* 		position: fixed; */
		background-position-y: center;
		width: auto;
		background-color: yellow;
		text-align: center;
		align-content: center;
		border-radius: 1em;
		
	}

	.decoded {
		/* 	margin-top: 18em; */
		margin-top: 1em;
		border-width: 1px;
		border-style: solid;
		border-radius: 1em;
	}

	.numberbox {
		width: 3em;
	}

	input {
		width: 9em;
	}
</style>
