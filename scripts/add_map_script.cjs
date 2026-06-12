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

// Insert the view rendering
content = content.replace(
  /\{activeTab === "overview" && \([\s\S]*?<\/>\s*\)\s*\}/,
  `{activeTab === "overview" && (
          <ProjectOverviewView
            info={projectInfo}
            setInfo={setProjectInfo}
            isLocked={activeCompany === "opco" ? isLockedOpCo : isLockedPropCo}
          />
        )}`
); // Let's not do it this way. That might break if the regex doesn't match perfectly.

fs.writeFileSync('/app/applet/scripts/add_map.cjs', content);
