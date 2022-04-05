import { writable } from "svelte/store"

export const triangularNumbers = writable([]);

export const fibonacciNumbers = writable([]);

const number = 25;

let n1 = 1, n2 = 1, nextTerm;

console.log('Fibonacci Series:');

let localArray = []

for (let i = 1; i <= number; i++) {
    console.log(i,n1);
    localArray.push(n1);
    nextTerm = n1 + n2;
    n1 = n2;
    n2 = nextTerm;
}


fibonacciNumbers.set(localArray);

