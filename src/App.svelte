<script>
	import Decoder from "./pages/Decoder.svelte";
</script>

<!-- {"cipherName":"English Ordinal",
"cipherCategory":"English",
"H":120,"S":65,"L":62,
"cArr":[97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122],
"vArr":[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26],
"diacriticsAsRegular":true,
"caseSensitive":false,"enabled":true,"cp":[],"cv":[],"sumArr":[]} -->
	

		<nav>
		<h5>
			Gematria Decoder by Tony
		</h5>
	<Decoder />
	
</nav>

<main>

</main>

<style>

	h5 {
		color: blue;
		text-shadow: 4px 4px 2px rgb(212, 27, 172);
		position: absolute;
		margin-left: 2em;
		vertical-align: top;
		
	}
	main {
		text-align: center;
		padding: 0;
		max-width: 240px;
		margin: 0;
	}

	nav {
		clear: left;
	}



	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}

	.highlight {
		color: yellow;
		background-color: red;
		font-style: oblique;
	}

	div {
		padding-top: 0px;
		margin-top: 0px;

		
	}
	
</style>
