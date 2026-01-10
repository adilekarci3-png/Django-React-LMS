// src/components/OrgNode.jsx
import React, { useState } from "react";
import "./css/OrgChart.css";

const MAX_PER_ROW = 4;

function getColors(name = "") {
  const n = name.toLowerCase();
  if (n.includes("eğitim"))
    return { bg: "linear-gradient(135deg,#eef2ff,#e0ecff)", border: "#4f46e5" };
  if (n.includes("mali"))
    return { bg: "linear-gradient(135deg,#fff7ed,#fde68a)", border: "#f97316" };
  if (n.includes("tanıtım") || n.includes("medya"))
    return { bg: "linear-gradient(135deg,#ecfeff,#dbeafe)", border: "#0284c7" };
  if (n.includes("gençlik"))
    return { bg: "linear-gradient(135deg,#f0fdf4,#dcfce7)", border: "#22c55e" };
  if (n.includes("sekreter"))
    return { bg: "linear-gradient(135deg,#fdf2f8,#fce7f3)", border: "#db2777" };
  if (n.includes("insan kaynak") || n.includes("bilgi işlem"))
    return { bg: "linear-gradient(135deg,#fef9c3,#fef3c7)", border: "#ca8a04" };
  if (n.includes("teşkilat"))
    return { bg: "linear-gradient(135deg,#eff6ff,#dbeafe)", border: "#2563eb" };
  if (n.includes("uhab") || n.includes("uluslararası"))
    return { bg: "linear-gradient(135deg,#f1f5f9,#e2e8f0)", border: "#0f172a" };
  if (n.includes("başkan"))
    return { bg: "linear-gradient(135deg,#faf5ff,#e9d5ff)", border: "#7c3aed" };
  return { bg: "linear-gradient(135deg,#ffffff,#f8fafc)", border: "#94a3b8" };
}

function chunkChildren(children = [], size = MAX_PER_ROW) {
  const out = [];
  for (let i = 0; i < children.length; i += size) {
    out.push(children.slice(i, i + size));
  }
  return out;
}

const OrgNode = ({ node }) => {
  const [show, setShow] = useState(false);

  const hasPeople =
    (node.employees && node.employees.length > 0) ||
    (node.members && node.members.length > 0);

  const rows =
    node.children && node.children.length > 0
      ? chunkChildren(node.children, MAX_PER_ROW)
      : [];

  const colors = getColors(node.name);

  return (
    <li className="org-node">
      <div
        className={`org-box ${hasPeople ? "has-people" : ""}`}
        style={{
          background: colors.bg,
          borderColor: `${colors.border}33`,
          boxShadow: `0 6px 20px ${colors.border}18`,
        }}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        <span className="org-name" title={node.name}>
          {node.name}
        </span>

        {show && hasPeople && (
          <div className="org-tooltip org-tooltip--card">
            <div
              className="org-tooltip-header"
              style={{ background: colors.border }}
            >
              <div className="org-tooltip-title">{node.name}</div>
              <div className="org-tooltip-sub">
                Bu birimde görevli kişiler
              </div>
            </div>

            <div className="org-tooltip-body">
              {node.employees && node.employees.length > 0 && (
                <div className="org-tooltip-section">
                  <p className="tip-title">Departmana Bağlı Üyeler</p>
                  <ul>
                    {node.employees.map((emp) => (
                      <li key={`emp-${emp.id}`} className="org-person">
                        <div className="org-person-avatar">
                          {emp.full_name?.charAt(0) || "Ü"}
                        </div>
                        <div className="org-person-info">
                          <div className="org-person-name">
                            {emp.full_name}
                          </div>
                          {emp.title ? (
                            <div className="org-person-title">{emp.title}</div>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {node.members && node.members.length > 0 && (
                <div className="org-tooltip-section">
                  <p className="tip-title">Organizasyon Üyeleri</p>
                  <ul>
                    {node.members.map((mem) => (
                      <li key={`mem-${mem.id}`} className="org-person">
                        <div className="org-person-avatar">
                          {mem.Name?.charAt(0) || "Ü"}
                        </div>
                        <div className="org-person-info">
                          <div className="org-person-name">{mem.Name}</div>
                          {mem.designation_name ? (
                            <div className="org-person-title">
                              {mem.designation_name}
                            </div>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="org-tooltip-arrow" />
          </div>
        )}
      </div>

      {rows.length > 0 &&
        rows.map((row, idx) => (
          <ul key={idx} className="org-children-row">
            {row.map((child) => (
              <OrgNode key={child.id} node={child} />
            ))}
          </ul>
        ))}
    </li>
  );
};

export default OrgNode;
