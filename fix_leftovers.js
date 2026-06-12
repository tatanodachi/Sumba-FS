import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

let lines = code.split('\n');

// We need to delete lines from index 6408 to 7130 (which corresponds to lines 6409 to 7131).
// Let's verify by checking the text of line 6408:
console.log("Line 6409 is:", lines[6408]);
console.log("Line 7131 is:", lines[7130]);

lines.splice(6408, 7130 - 6408 + 1);

// Now the indices shift.
// Old line 7755 was at index 7754.
// Shift amount = 7130 - 6408 + 1 = 723 lines.
let new7755 = 7754 - 723;
let new7942 = 7941 - 723;

console.log("Shifted 7755 is:", lines[new7755]);
console.log("Shifted 7942 is:", lines[new7942]);

lines.splice(new7755, new7942 - new7755 + 1);

fs.writeFileSync('src/App.tsx', lines.join('\n'));
console.log("Deleted dead code blocks!");
