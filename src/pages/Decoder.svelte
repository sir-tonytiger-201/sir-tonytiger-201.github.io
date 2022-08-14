<script>
	import TextInput from "../components/TextInput.svelte";
	import cipherList from "../calc/ciphers";
	import { shortcut } from "../js/shortcut";
	import TriangularNumbers from "./TriangularNumbers.svelte";
	import FibonacciNumbers from "./FibonacciNumbers.svelte";
	import { scale } from "svelte/transition";
	import { cubicOut } from "svelte/easing";
	import { triangularNumbers } from "../js/store";
	import Clipboard from "../components/Clipboard.svelte";

	let text = "";
	let selectedCipher = 0;
	let selected = 0;
	let triangularHighlight = {};
	let fibonacciHighlight = {};
	let quickWord = "";
	export let focussed = true;
	const params = {
		ignoreTrivial: false,
		onlyShowHighlighted: false,
		showValues: true,
	};

	let showValues = false;
	let numberLookup = "";
	let numberSearch = "";
	let customNumberFilter = [];
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

	const trivialList = [
		"a",
		"is",
		"or",
		"of",
		"if",
		"at",
		"the",
		"also",
		"for",
		"said",
		"then",
		"his",
		"has",
		"was",
		"and",
		"was",
	];

	const addToHighlights = (num) => {
		if (!customNumberFilter.includes(Number(num))) {
			customNumberFilter = [...customNumberFilter, Number(num)];
			triangularHighlight = triangularHighlight;
			console.log(customNumberFilter);
			numberSearch = "";
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
		fibonacciHighlight = fibonacciHighlight;
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
			JSON.stringify(letterValues, null, "") +
				JSON.stringify(currentCipher)
		);
	};

	const cycleBackward = () => {
		if (selectedCipher > 0) {
			selectedCipher -= 1;
		} else {
			selectedCipher = cipherList.length - 1;
		}
		focussed = false;
	};
	const cycleForward = () => {
		if (selectedCipher < cipherList.length - 1) {
			selectedCipher += 1;
		} else {
			selectedCipher = 0;
		}
		focussed = false;
	};

	const valueOf = (c) => {
		//console.log("character is ", c, c.charCodeAt(0));
		//console.log(currentCipher.vArr);
		const val =
			currentCipher.vArr[currentCipher.cArr.indexOf(c.charCodeAt(0))] ||
			0;
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
		for (const c of word) {
			if (
				currentCipher.vArr[
					currentCipher.cArr.indexOf(c.toLowerCase().charCodeAt(0))
				]
			) {
				simplified += c;
			}
		}
		if (word !== simplified) {
			//console.log(word," simplified is ", simplified)
		}

		return simplified;
	};

	$: if (selectedCipher === selectedCipher) {
		quickDecode = evalWord(quickWord);
	}

	const highlight = (text, customClass = "highlight") => {
		let [word, value] =
			typeof text === "string" ? text.split(" ") : [text, 0];
		if (!params.showValues) text = word;
		if (typeof word === "number") word = word.toString();
		if (
			params.ignoreTrivial &&
			(trivialList.includes(simplify(word.toLowerCase())) ||
				simplify(word).length < 3)
		) {
			return params.onlyShowHighlighted ? "" : text;
		} else {
			if (numberInfo[value]) {
				return `<a href='${numberInfo[value]}' class='${customClass}' target="_blank">${text}</a>`;
			} else {
				return `<span class='${customClass}'> ${text} </span>`;
			}
		}
	};

	const triangleHighlight = (text) => {
		const word = simplify(text.split(" ")[0]);
		if (!params.showValues) text = word;
		if (
			params.ignoreTrivial &&
			(trivialList.includes(word.toLowerCase()) ||
				simplify(word).length < 3)
		) {
			return params.onlyShowHighlighted ? "" : text;
		} else {
			return "<span class='triangle-highlight'>" + text + "</span>";
		}
	};

	const simpleNumericReduction = (value) => {
		let val = 0;
		for (const c of value.toString()) {
			val += Number(c);
		}

		if (val.toString().length > 1) val = simpleNumericReduction(val);
		return val;
	};

	const decode = (t) => {
		let decoded = "";
		let combinedValue = { num: 0, html: "" };
		let val = 0;
		let reducedNumerical = "";

		for (const line of t.split("\n")) {
			combinedValue.num = 0;
			for (const word of line.split(" ")) {
				if (!word) continue;
				val = evalWord(word);
				combinedValue.num += val;

				if (customNumberFilter.includes(val)) {
					console.log("found", val);
					const returnedValue = highlight(
						word + " " + val,
						"highlight2"
					);
					console.log("returnedValue =", returnedValue);
					if (returnedValue) {
						decoded += returnedValue + " ";
						//console.log("decoded =",decoded)
					} else {
						combinedValue.num -= val;
					}
				} else if (specialNumbers.includes(val)) {
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
				} else if (fibonacciHighlight[val] === true) {
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

			if (customNumberFilter.includes(combinedValue.num)) {
				combinedValue.html = highlight(combinedValue.num, "highlight2");
			} else if ($triangularNumbers.includes(combinedValue.num)) {
				combinedValue.html =
					"<span class='triangle-highlight'>" +
					combinedValue.num +
					"</span>";
			} else if (specialNumbers.includes(combinedValue.num)) {
				combinedValue.html = highlight(combinedValue.num);
			} else {
				combinedValue.html = combinedValue.num;
			}

			if (decoded.length > 0) {
				reducedNumerical = simpleNumericReduction(combinedValue.num);
				decoded +=
					combinedValue.num > 0 && params.showValues
						? "(" + combinedValue.html + ") "
						: "<br>";
				decoded +=
					reducedNumerical > 0 && params.showValues
						? "[" + reducedNumerical + "]<br><br>"
						: "<br>";
			}
		}

		return decoded;
	};

	$: quickDecode = evalWord(quickWord);

	const pasteText = async () => {
		if (navigator.clipboard) {
		} else {
			console.log("clipsboard not found");
		}
		text = await navigator.clipboard.readText();
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
	<div class="fixed">
		<center>
			<TriangularNumbers bind:triangularHighlight />
			<FibonacciNumbers bind:fibonacciHighlight />
			<nav>
				<!-- <h1>Decoder</h1> -->
				<button on:click={pasteText}>Paste text</button>
				<button on:click={() => (text = "")}>Clear text</button>
				<input
					type="text"
					bind:value={quickWord}
					placeholder="quick decode"
				/>
				<input
					type="text"
					readonly
					class="numberbox"
					bind:value={quickDecode}
				/>

				<!-- 
						use:shortcut={{
							code: "Enter",
							callback: () => numberSearch && addToHighlights(numberSearch),
						}}
 -->
				<input
					type="text"
					bind:value={numberSearch}
					placeholder="number search"
				/>
				<button on:click={() => addToHighlights(numberSearch)}
					>go</button
				>
				<button on:click={() => toggleAndUpdate("onlyShowHighlighted")}>
					show
					{#if params.onlyShowHighlighted}
						all
					{:else}
						only highlighted
					{/if}
				</button>

				<button on:click={() => toggleAndUpdate("ignoreTrivial")}>
					{#if params.ignoreTrivial} show {:else} hide {/if} trivial
				</button>
				<button on:click={() => toggleAndUpdate("showValues")}>
					{#if params.showValues} hide {:else} show {/if} values
				</button>
				<button on:click={displayCipher}>cipher info</button>
				<select
					bind:value={selectedCipher}
					use:shortcut={{
						code: "Home",
						callback: () => (selectedCipher = 0),
					}}
				>
					{#each cipherList as cipher, i}
						<option value={i}>
							{i + 1}: {cipher.cipherName}
						</option>
					{/each}
				</select>
				<!-- Current Cipher: {currentCipher.cipherName} -->

				<button
					on:click={cycleBackward}
					use:shortcut={{
						shift: true,
						code: "Tab",
						callback: cycleBackward,
					}}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						fill="currentColor"
						class="bi bi-arrow-left-square"
						viewBox="0 0 16 16"
					>
						<path
							fill-rule="evenodd"
							d="M15 2a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2zM0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zm11.5 5.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5z"
						/>
					</svg>
				</button>
				<button
					on:click={cycleForward}
					use:shortcut={{ code: "Tab", callback: cycleForward }}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						fill="currentColor"
						class="bi bi-arrow-right-square"
						viewBox="0 0 16 16"
					>
						<path
							fill-rule="evenodd"
							d="M15 2a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2zM0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zm4.5 5.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H4.5z"
						/>
					</svg>
				</button>

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
				<button disabled={true}>Sorted Results</button>
			</nav>

			<TextInput
				{shortcut}
				label="Text to decode"
				bind:value={text}
				bind:focussed
				multiline={true}
			/>

			{cipherString()}
		</center>
	</div>
	<div
		class="decoded"
		transition:scale={{ duration: 1000, easing: cubicOut }}
	>
		<!-- 	<p>{text}</p>
	<p>
		{JSON.stringify(currentCipher)}
	</p> -->
		{#key selectedCipher}
			{#key (triangularHighlight, fibonacciHighlight)}
				{@html decode(text).replace(/<br><br>/g, "<br>")}
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
		/* max-width: 640px; */
		margin: 0px;
	}

	select {
		color: yellow;
		background-color: blue;
		box-shadow: 9px 7px 8px rgba(200, 14, 224, 0.863);
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

	:global(.highlight, a.highlight) {
		color: yellow;
		background-color: blue;
		font-style: italic;
		font-weight: bold;
	}

	:global(.highlight2, a.highlight2) {
		color: gold;
		background-color: orangered;
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
		margin-right: auto;
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
