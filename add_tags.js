import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

function addTags(name, count) {
  let start = code.indexOf('const ' + name + ' = memo((');
  if (start === -1) return;
  let end = code.indexOf('});', start) + 3;
  let chunk = code.substring(start, end);
  
  let newChunk = chunk.replace(/\s*\);\s*\}\);$/, '\n' + '  </div>\n'.repeat(count) + '  );\n});');
  if (newChunk !== chunk) {
    code = code.substring(0, start) + newChunk + code.substring(end);
    console.log(`Added ${count} tags to ${name}`);
  }
}

addTags('OperationCascadeView', 2);
addTags('AssetCascadeView', 1);
addTags('ConsolidatedCascadeView', 1);

fs.writeFileSync('src/App.tsx', code);
