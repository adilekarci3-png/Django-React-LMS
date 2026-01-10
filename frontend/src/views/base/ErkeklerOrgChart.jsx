// src/pages/ErkeklerOrgChart.jsx
import React, { useEffect, useState } from "react";
import { fetchOrgChartByName } from "../../api/orgChartApi";
import OrgNode from "./OrgNode";
import "./css/OrgChart.css";

import HomeHeader from "../partials/HomeHeader";
import HomeFooter from "../partials/HomeFooter";

// basit fallback – gerçek yapıyı istersen buraya da koy
const ERKEKLER_FALLBACK = {
  id: 1000,
  name: "Erkekler",
  employees: [],
  members: [],
  children: [
    { id: 1001, name: "Teşkilat Komisyonu", children: [] },
    { id: 1002, name: "Eğitim Komisyonu", children: [] },
    { id: 1003, name: "Mali İşler Komisyonu", children: [] },
    { id: 1004, name: "Tanıtım ve Medya Komisyonu", children: [] },
  ],
};

function mergePeople(staticNode, apiNode) {
  if (!apiNode) return staticNode;
  const merged = {
    ...staticNode,
    employees: apiNode.employees || [],
    members: apiNode.members || [],
  };
  if (staticNode.children && staticNode.children.length > 0) {
    merged.children = staticNode.children.map((child) => {
      const match =
        apiNode.children &&
        apiNode.children.find(
          (c) => c.name && c.name.toLowerCase() === child.name.toLowerCase()
        );
      return mergePeople(child, match);
    });
  }
  return merged;
}

const ErkeklerOrgChart = () => {
  const [root, setRoot] = useState(ERKEKLER_FALLBACK);
  const [loading, setLoading] = useState(true);
  const slug = "erkekler";

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchOrgChartByName(slug);
        const merged = mergePeople(ERKEKLER_FALLBACK, data);
        setRoot(merged);
      } catch (e) {
        console.error(e);
        setRoot(ERKEKLER_FALLBACK);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      <HomeHeader />
      <div className="org-page org-page--full">
        <h1>Erkekler Teşkilat Şeması</h1>
        <p className="org-desc">Birimlerin üzerine gelince üyeleri görürsünüz.</p>

        {loading ? (
          <div className="org-loading">Yükleniyor...</div>
        ) : (
          <div className="org-tree-wrapper org-tree-wrapper--full">
            <div className="tree tree--full">
              <ul>
                <OrgNode node={root} />
              </ul>
            </div>
          </div>
        )}
      </div>
      <HomeFooter />
    </>
  );
};

export default ErkeklerOrgChart;
