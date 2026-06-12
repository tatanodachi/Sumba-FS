import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

function extractJSX(name) {
  let start = code.indexOf('const ' + name + ' = memo((');
  let end = code.indexOf('});', start) + 3;
  let chunk = code.substring(start, end);
  return chunk;
}

let op = extractJSX('AssetCascadeView');
fs.writeFileSync('debug_asset.txt', op);
