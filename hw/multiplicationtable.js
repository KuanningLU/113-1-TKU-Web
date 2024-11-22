"use strict";
function printMultiplicationTable() {
    console.log("九九乘法表\n");
    for (let i = 1; i <= 9; i++) {
        let row = "";
        for (let j = 1; j <= 9; j++) {
            const result = i * j;
            const formattedResult = result < 10 ? $ : , { result };
            row += `${i} x ${j} = ${formattedResult}    `;
            if (j % 3 === 0) {
                console.log(row);
                row = "";
            }
        }
        if (row !== "") {
            console.log(row);
        }
    }
    let separator = "";
    for (let i = 0; i < 50; i++) {
        separator += "-";
    }
    console.log(separator);
}
printMultiplicationTable();
