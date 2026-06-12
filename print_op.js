import fs from 'fs';
let reps = JSON.parse(fs.readFileSync('replacements.json', 'utf8'));
let opc = reps.AssetCascadeView;
let lines = opc.split('\n');
for (let i = lines.length - 20; i < lines.length; i++) {
  console.log(i + ": " + lines[i]);
}
