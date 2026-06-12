const fs = require('fs');
let content = fs.readFileSync('src/financialEngine.ts', 'utf8');

// Export helpers
content = content.replace('const calculatePMT', 'export const calculatePMT');
content = content.replace('const calculatePayback', 'export const calculatePayback');
content = content.replace('const calculateIRR', 'export const calculateIRR');
content = content.replace('const calculateNPV', 'export const calculateNPV');
content = content.replace('const DEFAULT_PROPCO_ASSUMPTIONS', 'export const DEFAULT_PROPCO_ASSUMPTIONS');
content = content.replace('const runPropCoEngine', 'export const runPropCoEngine');
content = content.replace('const formatNumber', 'export const formatNumber');
content = content.replace('const formatCurrency', 'export const formatCurrency');

// Filter out OpCo/Consolidated Engines completely
const opCoRegex = /const runOpCoEngine = [\s\S]*?(?=const runPropCoEngine)/;
const consolidatedRegex = /const runConsolidatedEngine = [\s\S]*/;

content = content.replace(opCoRegex, '');
content = content.replace(consolidatedRegex, '');

// Clean OpCoAssumptions if present
const defOpCoRegex = /const DEFAULT_OPCO_ASSUMPTIONS = {[\s\S]*?};\n/g;
content = content.replace(defOpCoRegex, '');

// Modify runPropCoEngine logic
content = content.replace(
  'const runPropCoEngine = (assumptions, opCoModelData, config) => {',
  'export const runPropCoEngine = (assumptions: any, config?: any) => {'
);
content = content.replace(/let avgDscr = 0,[\s\S]*?let bvB = buildBasis/g, 'let avgDscr = 0,\n    avgYield = 0;\n  let bvB = buildBasis');

content = content.replace(
  /let revenue = assumptions\.linkToOpCo[\s\S]*?Math\.pow\(1 \+ assumptions\.manualRentEscalation \/ 100, i - 1\);/g,
  'let revenue = (assumptions.manualBaseRent||0) * Math.pow(1 + (assumptions.manualRentEscalation||0) / 100, i - 1);'
);

content = content.replace(
  /costPerBed:[\s\S]*?0,/g,
  'costPerBed: assumptions.beds > 0 ? (totalCapex / assumptions.beds) : 0,'
);

fs.writeFileSync('src/financialEngine.ts', content);
console.log('Engine modified successfully.');
