// TabContainer.jsx
import React, { useEffect, useMemo, useState } from "react";

export function TabContainer({ tabs = [] }) {
  const normalizedTabs = useMemo(() => {
    const seen = new Set();
    return tabs.filter((t, i) => {
      if (!t?.key) { console.warn(`[TabContainer] Tab ${i} missing key`); return false; }
      if (seen.has(t.key)) { console.warn(`[TabContainer] Duplicate key "${t.key}"`); return false; }
      seen.add(t.key);
      return true;
    });
  }, [tabs]);

  const [activeKey, setActiveKey] = useState(normalizedTabs[0]?.key ?? null);

  useEffect(() => {
    if (!normalizedTabs.some(t => t.key === activeKey)) {
      setActiveKey(normalizedTabs[0]?.key ?? null);
    }
  }, [normalizedTabs, activeKey]);

  return (
    <div>
      <ul className="nav nav-tabs">
        {normalizedTabs.map(tab => (
          <li className="nav-item" key={tab.key}>
            <button
              type="button"
              className={`nav-link ${activeKey === tab.key ? "active" : ""}`}
              onClick={() => setActiveKey(tab.key)}
            >
              {tab.title}
            </button>
          </li>
        ))}
      </ul>

      <div className="tab-content mt-3">
        {normalizedTabs.map(tab => (
          <div
            key={tab.key}
            className={`tab-pane ${activeKey === tab.key ? "active" : ""}`}
          >
            {tab.component}
          </div>
        ))}
      </div>
    </div>
  );
}
