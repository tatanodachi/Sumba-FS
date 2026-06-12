import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Fix the extra </div> in the three views
function removeExtraDiv(componentName) {
  const startStr = `const ${componentName} = memo((`;
  const startIdx = code.indexOf(startStr);
  if (startIdx === -1) {
    console.log("Could not find", componentName);
    return;
  }
  
  // Find the exact "</div>\n  </div>\n  );\n});" and remove one "</div>\n  "
  // Let's do a localized regex replacement
  const componentContent = code.substring(startIdx, code.indexOf('});', startIdx) + 3);
  const fixedContent = componentContent.replace(/<\/div>\s*<\/div>\s*\);\s*\}\);/, '</div>\n  );\n});');
  
  if (componentContent !== fixedContent) {
    code = code.substring(0, startIdx) + fixedContent + code.substring(startIdx + componentContent.length);
    console.log("Fixed extra div in", componentName);
  } else {
    // try another pattern
    const fixedContent2 = componentContent.replace(/<\/div>\s*<\/div>\s*<\/div>\s*\);\s*\}\);/, '</div>\n  </div>\n  );\n});');
     if (componentContent !== fixedContent2) {
       code = code.substring(0, startIdx) + fixedContent2 + code.substring(startIdx + componentContent.length);
       console.log("Fixed extra div in", componentName, "with fallback");
     } else {
       console.log("No extra div matched for", componentName);
     }
  }
}

removeExtraDiv('OperationCascadeView');
removeExtraDiv('AssetCascadeView');
removeExtraDiv('ConsolidatedCascadeView');

// 2. Restore the operation block
// Let's find: `        {activeTab !== "overview" && activeTab !== "map" &&`
// which is followed by `activeCompany === "asset"`
const assetBlockStart = code.indexOf('{activeTab !== "overview" && activeTab !== "map" &&\\n          activeTab !== "collab" &&\\n          activeTab !== "timeline" &&\\n          activeTab !== "ai" &&\\n          activeCompany === "asset" &&'.replace(/\\n/g, '\n'));

const assetBlockFallback = code.indexOf('activeCompany === "asset" &&\n          activeGroup === "financials" && (');

let injectIndex = assetBlockStart !== -1 ? assetBlockStart : (assetBlockFallback !== -1 ? code.lastIndexOf('{', assetBlockFallback) : -1);

// We must also restore the missing code from where we deleted 11839.
// Our deleted subnav block also probably ate something else.
// Actually, let's just insert it cleanly right before the Asset block.
if (injectIndex !== -1) {
  // Let's find the closing brace for the previous block, if any.
  const operationBlock = `
        {activeTab !== "overview" && activeTab !== "map" &&
          activeTab !== "collab" &&
          activeTab !== "timeline" &&
          activeTab !== "ai" &&
          activeCompany === "operation" &&
          activeGroup === "financials" && (
            <div className="animate-in fade-in duration-500 space-y-6">
              {activeTab === "dashboard" && (
                <OperationDashboardView
                  data={opCoModelData}
                  assumptions={operationAssumptions}
                  setTab={setActiveTab}
                  isPresenting={isPresenting}
                />
              )}
              {activeTab === "comprehensive" && (
                <OperationCascadeView data={opCoModelData} viewResolution={viewResolution} setViewResolution={setViewResolution} />
              )}
              {activeTab === "sensitivity" && (
                <OperationSensitivityView
                  assumptions={operationAssumptions}
                />
              )}
              {activeTab === "assumptions" && (
                <SettingsPasswordGate>
                  <OperationSettingsView
                    assumptions={operationAssumptions}
                    onChange={handleOperationChange}
                    onSyncEquity={syncEquityWithSharing}
                    onValidate={validateAssumptions}
                    isLocked={isLockedOperation}
                    onToggleLock={() => setIsLockedOperation(!isLockedOperation)}
                    onSave={() => saveDefaultsToCloud("operation")}
                    saveStatus={saveStatusOperation}
                    onReset={() => setOperationAssumptions(DEFAULT_OPERATION_ASSUMPTIONS)}
                    isCloudSync={isCloudSync}
                    isPresenting={isPresenting}
                  />
                </SettingsPasswordGate>
              )}
            </div>
          )}
          
`;

  // We are going to find the start of the `asset` block and inject `operationBlock` right before it.
  const realInjectIndex = code.lastIndexOf('{activeTab !== "overview"', assetBlockFallback);
  if (realInjectIndex !== -1) {
     code = code.substring(0, realInjectIndex) + operationBlock + code.substring(realInjectIndex);
     console.log("Restored Operation block!");
  } else {
     console.log("Could not find insertion point for Operation block.");
  }
} else {
  console.log("Could not find Asset block.");
}

fs.writeFileSync('src/App.tsx', code);
console.log("Done fixing.");
