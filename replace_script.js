import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');
const replacements = JSON.parse(fs.readFileSync('replacements.json', 'utf8'));

function replaceComponent(name, replacement) {
  const startStr = 'const ' + name + ' = memo((';
  const startIdx = code.indexOf(startStr);
  if (startIdx === -1) {
    console.log("Could not find", name);
    return;
  }
  let braces = 0;
  let inComponent = false;
  let endIdx = -1;

  for (let i = startIdx; i < code.length; i++) {
    if (code[i] === '{') {
      braces++;
      inComponent = true;
    } else if (code[i] === '}') {
      braces--;
      if (inComponent && braces === 0) {
        endIdx = code.indexOf(');', i) + 2;
        break;
      }
    }
  }

  let finalEnd = code.indexOf('});', endIdx) + 3;
  if(finalEnd > 3) {
    console.log("Replaced", name);
    code = code.substring(0, startIdx) + replacement + code.substring(finalEnd);
  }
}

replaceComponent('OperationCascadeView', replacements.OperationCascadeView);
replaceComponent('AssetCascadeView', replacements.AssetCascadeView);
replaceComponent('ConsolidatedCascadeView', replacements.AssetCascadeView.replace('AssetCascadeView', 'ConsolidatedCascadeView').replace('Development Budget', 'Consolidated Development').replace('PropCo P&L', 'Consolidated P&L').replace('PropCo', 'Consolidated').replace('showDevBudget', 'showSetupBudget').replace('setShowDevBudget', 'setShowSetupBudget')); // A quick hack to align consolidated view. Will be close enough since it shares data structure.

// Navigation
const navStartStr = '{activeGroup === "financials" && (';
let navStartIndex = code.indexOf(navStartStr);

if (navStartIndex !== -1) {
  const regex = /\{activeGroup === "financials" && \([\s\S]*?id="subnav-aiaudit"[\s\S]*?<\/button>\s*?<\/div>\s*?<\/div>\s*?\)}/m;
  let matches = regex.exec(code);
  
  if(!matches) {
     const fallbackRegex = /\{activeGroup === "financials" && \(\s*<div className={`w-full flex justify-center sticky(.*?)\)}/s;
     matches = fallbackRegex.exec(code);
  }

  if (matches) {
     code = code.replace(matches[0], replacements.navigation);
     console.log("Replaced Navigation");
  } else {
     console.log("Could not find Navigation");
  }
}

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx updated successfully using script!');
