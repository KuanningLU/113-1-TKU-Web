function checkNumber(num: number): string {
    if (num % 2 === 0) {
        return "even";
    } else {
        return "odd";
    }
}

for (let i: number = 1; i <= 10; i++) {
    const result: string = checkNumber(i);
    console.log(`Number ${i} is ${result}`);
}

const checkNumberTernary = (num: number): string => 
    num % 2 === 0 ? "even" : "odd";

console.log("\nAnother version using array methods:");
Array.from({ length: 10 }, (_, i) => i + 1).forEach(num => {
    console.log(`Number ${num} is ${checkNumberTernary(num)}`);
});

