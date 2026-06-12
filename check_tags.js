import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

function checkTags(name) {
  let start = code.indexOf('const ' + name + ' = memo((');
  let end = code.indexOf('});', start) + 3;
  let chunk = code.substring(start, end);
  let openDivs = (chunk.match(/<div(?=[\s>])/g) || []).length;
  let closeDivs = (chunk.match(/<\/div>/g) || []).length;
  console.log(name, "open:", openDivs, "close:", closeDivs, "diff:", openDivs - closeDivs);
}

checkTags('OperationCascadeView');
checkTags('AssetCascadeView');
checkTags('ConsolidatedCascadeView');

// Also try to find where App component opens and closes
let appStart = code.indexOf('export default function App() {');
let retStart = code.indexOf('return (', appStart);
let mainStart = code.lastIndexOf('<main', code.length);
let mainEnd = code.indexOf('</main>', mainStart);
console.log("App starts at", appStart, "returns at", retStart);
