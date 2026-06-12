const fs = require('fs');
let text = fs.readFileSync('src/App.tsx', 'utf8');
let lines = text.split('\n');
// Delete lines 11839 to 11892 (which is index 11838 to 11891)
lines.splice(11838, 54);
fs.writeFileSync('src/App.tsx', lines.join('\n'));
console.log('Deleted lines 11839-11892 from App.tsx');
