import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

function debugParensScope(name) {
  let start = code.indexOf('const ' + name + ' = memo((');
  let end = code.indexOf('});', start) + 3;
  let chunk = code.substring(start, end);

  let depth = 0;
  for (let i = 0; i < chunk.length; i++) {
    if (chunk[i] === '(') depth++;
    if (chunk[i] === ')') {
      depth--;
      if (depth < 0) {
        console.log("Paren depth became negative at index", i, chunk.substring(i - 20, i + 20));
        return;
      }
    }
  }
  console.log("Final paren depth for", name, ":", depth);
}

debugParensScope('OperationCascadeView');
debugParensScope('AssetCascadeView');
debugParensScope('ConsolidatedCascadeView');
