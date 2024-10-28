function checkNumber(num) {
    if (num % 2 === 0) {
        return "even";
    }
    else {
        return "odd";
    }
}
for (var i = 1; i <= 10; i++) {
    var result = checkNumber(i);
    console.log("Number ".concat(i, " is ").concat(result));
}
var checkNumberTernary = function (num) {
    return num % 2 === 0 ? "even" : "odd";
};
console.log("\nAnother version using array methods:");
Array.from({ length: 10 }, function (_, i) { return i + 1; }).forEach(function (num) {
    console.log("Number ".concat(num, " is ").concat(checkNumberTernary(num)));
});
