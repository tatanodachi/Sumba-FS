const fs = require('fs');

let content = fs.readFileSync('/app/applet/src/App.tsx', 'utf8');

// Insert map into presentation steps
content = content.replace(
  /\{\s*group: "context",\s*tab: "collab",\s*company: "opco",\s*label: "3\. Collaboration Model",\s*\}/,
  `{
        group: "context",
        tab: "map",
        company: "opco",
        label: "2. Site Map",
      },
      {
        group: "context",
        tab: "collab",
        company: "opco",
        label: "3. Collaboration Model",
      }`
);

// Insert Map icon to lucide-react import
if (!content.includes('Map,')) {
    content = content.replace(/BookOpen,/, 'BookOpen, Map,');
}

// Insert into icons
content = content.replace(
  /\) : activeTab === "collab" \? \(/,
  `) : activeTab === "map" ? (
                  <Map className="text-[#1C6048]" />
                ) : activeTab === "collab" ? (`
);

// Insert into labels
content = content.replace(
  /: activeTab === "collab"/,
  `: activeTab === "map"
                    ? "Interactive Site Map"
                    : activeTab === "collab"`
);

// Insert into navigation buttons
content = content.replace(
  /label="Overview"\s*\/>/,
  `label="Overview"
                  />
                  <NavButton
                    active={activeTab === "map"}
                    onClick={() => setActiveTab("map")}
                    icon={<Map size={14} />}
                    label="Site Map"
                  />`
);

// Render the Map component
content = content.replace(
  /\{activeTab === "overview" && \(/,
  `{activeTab === "map" && (
          <InteractiveDemographicMap />
        )}
        {activeTab === "overview" && (`
);

// Make sure that things like `activeTab !== "overview" && activeTab !== "collab" ...` are updated to ignore map tab as well
content = content.replace(/activeTab !== "overview" &&/g, 'activeTab !== "overview" && activeTab !== "map" &&');


fs.writeFileSync('/app/applet/src/App.tsx', content);
console.log('Update map tabs complete');
