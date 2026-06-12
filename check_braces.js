import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

function checkBraces(name) {
  let start = code.indexOf('const ' + name + ' = memo((');
  let end = code.indexOf('});', start) + 3;
  let chunk = code.substring(start, end);

  let open = (chunk.match(/\{/g) || []).length;
  let close = (chunk.match(/\}/g) || []).length;
  console.log(name, "open braces:", open, "close braces:", close, "diff:", open - close);
  
  let pOpen = (chunk.match(/\(/g) || []).length;
  let pClose = (chunk.match(/\)/g) || []).length;
  console.log(name, "open parens:", pOpen, "close parens:", pClose, "diff:", pOpen - pClose);
}

checkBraces('OperationCascadeView');
checkBraces('AssetCascadeView');
checkBraces('ConsolidatedCascadeView');
