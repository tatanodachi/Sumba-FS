const fs = require('fs');

let content = fs.readFileSync('/app/applet/src/App.tsx', 'utf8');

// Remove StudyView entirely
const studyViewRegex = /const StudyView = memo\(\(\{ isPresenting, info \}\) => \{[\s\S]*?(?=^const [A-Z][a-zA-Z0-9_]* =)/m;
content = content.replace(studyViewRegex, '');

// Removing StudyView reference
content = content.replace(/\{activeTab === "study" && \(\s*<StudyView isPresenting=\{isPresenting\} info=\{projectInfo\} \/>\s*\)\}/, '');

// Remove Study from navigation
const navRegex = /<NavButton\s*active=\{activeTab === "study"\}\s*onClick=\{\(\) => setActiveTab\("study"\)\}\s*icon=\{<BookOpen size=\{14\} \/>\}\s*label="Study"\s*\/>/;
content = content.replace(navRegex, '');

// Remove Study Feasibility from presentation steps
const studyStepRegex = /\{\s*group: "context",\s*tab: "study",\s*company: "opco",\s*label: "2. Feasibility Study",\s*\},/;
content = content.replace(studyStepRegex, '');

// Fix h1 activeTab labeling
content = content.replace(/:\s*activeTab === "study"\s*\?\s*"Feasibility Study"/, '');
content = content.replace(/:\s*activeTab === "study" \?\s*\(\s*<BookOpen className="text-\[#1C6048\]" \/>\s*\)/, '');


// Fix activeTab condition arrays
content = content.replace(/activeTab !== "study" &&/g, '');

fs.writeFileSync('/app/applet/src/App.tsx', content);
console.log('Done!');
