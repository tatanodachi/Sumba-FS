import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

function debugTags(name) {
  let start = code.indexOf('const ' + name + ' = memo((');
  let end = code.indexOf('});', start) + 3;
  let chunk = code.substring(start, end);
  
  let i = 0;
  let opens = [];
  let closes = [];
  let depth = 0;
  let lines = chunk.split('\n');
  
  lines.forEach((line, idx) => {
     let o = (line.match(/<div(?=[\s>])/g) || []).length;
     let c = (line.match(/<\/div>/g) || []).length;
     depth += (o - c);
     if (o > 0 || c > 0) {
        console.log(`L${idx+1}: +${o} -${c} | Depth: ${depth} | ${line.trim()}`);
     }
  });
  console.log(`Final depth for ${name}: ${depth}`);
}

debugTags('OperationCascadeView');
debugTags('AssetCascadeView');
debugTags('ConsolidatedCascadeView');
