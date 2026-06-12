const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Remove the financial engines inside App.tsx itself, since we extracted them
// Wait, we need to import them instead!
let newContent = content.replace(
  '// 2. FINANCIAL ENGINES',
  `import {
  runPropCoEngine,
  DEFAULT_PROPCO_ASSUMPTIONS,
  formatNumber,
  formatCurrency,
  calculatePMT,
  calculatePayback,
  calculateIRR,
  calculateNPV
} from "./financialEngine";

// 2. FINANCIAL ENGINES`
);

// Wipe out the internal implementations from App.tsx 
const startFn = newContent.indexOf('const formatNumber =');
const endFn = newContent.indexOf('// 3. UI ATOMIC COMPONENTS');

newContent = newContent.substring(0, startFn) + '\n\n' + newContent.substring(endFn);

// We need to keep some OpCo assumptions if they are referenced purely by the old UI components
// because if they are undefined, crash!
// Wait, we can supply dummy implementations or just replace opCoModelData everywhere.
// Since the prompt says "there's no OpCo and HoldCo, only PropCo", I will just provide dummy methods to avoid immediate React crash before the UI is properly pruned.
const dummyMethods = `
const DEFAULT_OPCO_ASSUMPTIONS = { sharingPercentA: 50 };
const runOpCoEngine = () => ({ annualData: [], opsMetrics: { beds: 100 } });
const runConsolidatedEngine = () => ({ annualData: [], metrics: {} });
`;

newContent = newContent.replace('// 3. UI ATOMIC COMPONENTS', dummyMethods + '\n// 3. UI ATOMIC COMPONENTS');

// Default active company to propco
newContent = newContent.replace(
  'const [activeCompany, setActiveCompany] = useState("opco");',
  'const [activeCompany, setActiveCompany] = useState("propco");'
);

// We should also replace calls to runPropCoEngine, which no longer take opCoModelData
newContent = newContent.replace(
  '() => runPropCoEngine(propCoAssumptions, opCoModelData, projConfig),',
  '() => runPropCoEngine(propCoAssumptions, projConfig),'
);
newContent = newContent.replace(
  'const pr1 = runPropCoEngine(propCoAssumptions, op1, p1);',
  'const pr1 = runPropCoEngine(propCoAssumptions, p1);'
);

fs.writeFileSync('src/App.tsx', newContent);
console.log('App.tsx patched successfully');
