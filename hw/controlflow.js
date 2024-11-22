"use strict";
function checkNumber(num) {
    if (num % 2 === 0) {
        return "even";
    }
    else {
        return "odd";
    }
}
for (let i = 1; i <= 10; i++) {
    const result = checkNumber(i);
    console.log(`Number ${i} is ${result}`);
}
const checkNumberTernary = (num) => num % 2 === 0 ? "even" : "odd";
console.log("\nAnother version using array methods:");
Array.from({ length: 10 }, (_, i) => i + 1).forEach(num => {
    console.log(`Number ${num} is ${checkNumberTernary(num)}`);
});
