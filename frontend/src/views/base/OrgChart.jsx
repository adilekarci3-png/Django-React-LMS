// src/views/base/OrgChart.jsx (tam sayfa; header sabit; panel çakışmasız; derlenebilir tam versiyon)
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useEdgesState,
  useNodesState,
  Handle,
  Position,
  ReactFlowProvider,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import dagre from "dagre";

// Avatarlar
import hafiz1 from "../../assets/images/orgavatar/hafiz-1.jpg";
import hafiz2 from "../../assets/images/orgavatar/hafiz-2.jpg";
import hafiz3 from "../../assets/images/orgavatar/hafiz-3.jpg";
import hafizHanim1 from "../../assets/images/orgavatar/hafiz-hanim (1).jpg";
import hafizHanim2 from "../../assets/images/orgavatar/hafiz-hanim (2).jpg";
import hafizHanim3 from "../../assets/images/orgavatar/hafiz-hanim (3).jpg";
import hafizHanim4 from "../../assets/images/orgavatar/hafiz-hanim (4).jpg";

import AkademiBaseHeader from "../partials/AkademiBaseHeader";
// import AkademiBaseFooter from "../partials/AkademiBaseFooter";

/* ==== boyutlar ==== */
const NODE_W = 240;
const NODE_H = 96;
const AVATAR = 52;
const PANEL_W = 360; // sağ panel genişliği (sabit)
const HEADER_H = 64; // header yüksekliği (sabit)

/* departmana göre renk (kurumsal tonlar) */
function deptColor(name = "") {
  const n = name.toLowerCase();
  if (n.includes("yönetim")) return "#1f4f82";
  if (n.includes("mühendis")) return "#1b7a5a";
  if (n.includes("sekreter")) return "#b26a00";
  if (n.includes("insan kaynak")) return "#5b3ea8";
  if (n.includes("mali")) return "#0f6a86";
  if (n.includes("eğitim")) return "#b32828";
  return "#475569";
}

/* ---------------- MOCK DATA ---------------- */
const sampleData = [
  {
    id: 1,
    full_name: "Ali Özdemir",
    title: "Eğitim Portalı Başkanı",
    department: 1,
    department_name: "Yönetim",
    photo: hafiz1,
    children: [
      {
        id: 2,
        full_name: "Mustafa Yılmaz",
        title: "Eğitim Portalı Genel Sekreter",
        department: 2,
        department_name: "Sekreter",
        photo: hafiz2,
        children: [
          { id: 3, full_name: "İsa Güler", title: "İnsan Kaynakları Müdürü", department: 2, department_name: "İnsan Kaynakları", photo: hafiz3, children: [] },
          { id: 4, full_name: "Adile Karci", title: "Bilgisayar Mühendisi", department: 2, department_name: "Mühendislik", photo: hafizHanim1, children: [] },
          { id: 7, full_name: "Furkan Kiraz", title: "Bilgisayar Mühendisi", department: 2, department_name: "Mühendislik", photo: hafiz2, children: [] },
          { id: 8, full_name: "Mehmet Emre Cebeci", title: "Bilgisayar Mühendisi", department: 2, department_name: "Mühendislik", photo: hafiz1, children: [] },
          { id: 18, full_name: "Recep Kepenek", title: "Bilgisayar Mühendisi", department: 2, department_name: "Mühendislik", photo: hafiz1, children: [] },
        ],
      },
      {
        id: 5,
        full_name: "Rabia Doğan",
        title: "Teşkilat Başkanı",
        department: 3,
        department_name: "Yönetim",
        photo: hafizHanim3,
        children: [
          { id: 6, full_name: "Aişe Esra Güneş", title: "Teşkilat Başkan Yardımcısı", department: 3, department_name: "Yönetim", photo: hafizHanim4, children: [] },
          { id: 9, full_name: "Selim Arslan", title: "Bölge Sorumlusu", department: 3, department_name: "Yönetim", photo: hafiz2, children: [] },
          { id: 10, full_name: "Hatice Yıldırım", title: "İlçe Koordinatörü", department: 3, department_name: "Yönetim", photo: hafizHanim1, children: [] },
        ],
      },
      {
        id: 11,
        full_name: "Murat Kaya",
        title: "Mali İşler Başkanı",
        department: 4,
        department_name: "Mali İşler",
        photo: hafiz1,
        children: [
          { id: 12, full_name: "Zeynep Demir", title: "Muhasebe Uzmanı", department: 4, department_name: "Mali İşler", photo: hafizHanim2, children: [] },
          { id: 13, full_name: "Hüseyin Koç", title: "Finans Analisti", department: 4, department_name: "Mali İşler", photo: hafiz3, children: [] },
        ],
      },
      {
        id: 14,
        full_name: "Elif Çetin",
        title: "Eğitim Başkanı",
        department: 5,
        department_name: "Eğitim",
        photo: hafizHanim4,
        children: [
          { id: 15, full_name: "Ayhan Öz", title: "Kurs Koordinatörü", department: 5, department_name: "Eğitim", photo: hafiz2, children: [] },
          { id: 16, full_name: "Merve Korkmaz", title: "Eğitmen", department: 5, department_name: "Eğitim", photo: hafizHanim1, children: [] },
          { id: 17, full_name: "Cem Yıldız", title: "Staj Koordinatörü", department: 5, department_name: "Eğitim", photo: hafiz1, children: [] },
        ],
      },
    ],
  },
];

/* ---------------- yardımcılar ---------------- */
function findInTrees(trees, id) {
  const target = String(id);
  const stack = [...trees];
  while (stack.length) {
    const n = stack.pop();
    if (String(n.id) === target) return n;
    if (n.children) stack.push(...n.children);
  }
  return null;
}

function pathToId(trees, id) {
  const target = String(id);
  function dfs(node, path) {
    const me = [...path, node];
    if (String(node.id) === target) return me;
    for (const c of node.children || []) {
      const r = dfs(c, me);
      if (r) return r;
    }
    return null;
  }
  for (const root of trees) {
    const r = dfs(root, []);
    if (r) return r;
  }
  return [];
}

/* ---------------- DAGRE LAYOUT (kompakt) ---------------- */
function layout(nodes, edges, direction = "TB") {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: direction, nodesep: 28, ranksep: 64, marginx: 8, marginy: 8 });
  g.setDefaultEdgeLabel(() => ({}));
  nodes.forEach((n) => g.setNode(n.id, { width: NODE_W, height: NODE_H }));
  edges.forEach((e) => g.setEdge(e.source, e.target));
  dagre.layout(g);
  return nodes.map((n) => {
    const p = g.node(n.id);
    n.position = { x: p.x - NODE_W / 2, y: p.y - NODE_H / 2 };
    return n;
  });
}

/* ---------------- NODE CARD ---------------- */
const NodeCard = React.memo(function NodeCard({ data, selected }) {
  const { full_name, title, department_name, photo, collapsed, toggle } = data;
  const accent = deptColor(department_name);

  return (
    <div
      style={{
        width: NODE_W,
        height: NODE_H,
        position: "relative",
        borderRadius: 12,
        background: "#ffffff",
        border: selected ? `2px solid ${accent}` : "1px solid #e2e8f0",
        boxShadow: selected ? `0 8px 24px ${accent}26` : "0 6px 18px rgba(2,6,23,.06)",
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: 10,
        transition: "box-shadow .2s, border-color .2s",
      }}
    >
      <span
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          borderTopLeftRadius: 12,
          borderBottomLeftRadius: 12,
          background: accent,
        }}
      />
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />

      <img
        src={photo}
        alt={full_name}
        loading="lazy"
        style={{
          width: AVATAR,
          height: AVATAR,
          borderRadius: "9999px",
          objectFit: "cover",
          objectPosition: "center",
          border: "1px solid #e2e8f0",
          flex: "0 0 auto",
        }}
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 15, lineHeight: "18px", color: "#0f172a" }} className="truncate">
          {full_name}
        </div>
        <div style={{ color: "#334155", fontSize: 12 }} className="truncate">
          {title || ""}
        </div>
        {department_name && (
          <span
            title={department_name}
            style={{
              marginTop: 6,
              display: "inline-block",
              fontSize: 10.5,
              padding: "2px 8px",
              borderRadius: 999,
              background: `${accent}10`,
              color: accent,
              border: `1px solid ${accent}`,
              maxWidth: "100%",
            }}
            className="truncate"
          >
            {department_name}
          </span>
        )}
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); toggle(); }}
        style={{
          fontSize: 13,
          width: 26,
          height: 26,
          lineHeight: "22px",
          borderRadius: 8,
          border: "1px solid #e2e8f0",
          background: "#fff",
          cursor: "pointer",
        }}
        title={collapsed ? "Çocukları aç" : "Çocukları kapat"}
      >
        {collapsed ? "+" : "−"}
      </button>
    </div>
  );
});

/* ---------------- SAĞ PANEL (DOCKED) ---------------- */
function PersonPanel({ person, trees }) {
  const path = useMemo(() => (person ? pathToId(trees, person.id) : []), [person, trees]);
  const parent = path.length > 1 ? path[path.length - 2] : null;
  const directReports = (person?.children || []).length;
  const peers = parent ? (parent.children || []).length - 1 : 0;

  return (
    <div style={{ height: "100%", display: "grid", gridTemplateRows: "auto 1fr" }}>
      <div style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>
        <strong style={{ fontSize: 15, color: "#0f172a" }}>Kişi Bilgisi</strong>
      </div>

      <div style={{ overflow: "auto", padding: 14 }}>
        {person ? (
          <>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
              <img src={person.photo} alt={person.full_name} style={{ width: 64, height: 64, borderRadius: 10, objectFit: "cover", border: "1px solid #e2e8f0" }} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 16, color: "#0f172a" }} className="truncate">{person.full_name}</div>
                <div style={{ color: "#475569", fontSize: 12 }} className="truncate">{person.title || "-"}</div>
                {person.department_name && (
                  <div style={{ marginTop: 6, fontSize: 10.5, display: "inline-block", padding: "2px 8px", borderRadius: 999, border: `1px solid ${deptColor(person.department_name)}`, color: deptColor(person.department_name) }} className="truncate" title={person.department_name}>
                    {person.department_name}
                  </div>
                )}
              </div>
            </div>

            {/* breadcrumb */}
            <div style={{ marginTop: 6, marginBottom: 8, fontSize: 12, color: "#64748b" }}>
              {path.map((n, i) => (
                <span key={n.id}>{i > 0 && " / "}{n.full_name}</span>
              ))}
            </div>

            {/* kısa istatistik */}
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <SmallStat label="Ekip" value={`${directReports}`} />
              <SmallStat label="Akran" value={`${Math.max(peers, 0)}`} />
            </div>

            <Section title="Doğrudan Raporlayanlar">
              {person.children && person.children.length > 0 ? (
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 6 }}>
                  {person.children.map((c) => (
                    <li key={c.id} style={{ display: "flex", gap: 8, alignItems: "center", border: "1px solid #e2e8f0", borderRadius: 10, padding: 8 }}>
                      <img src={c.photo} alt={c.full_name} style={{ width: 34, height: 34, borderRadius: 8, objectFit: "cover" }} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 12.5 }} className="truncate">{c.full_name}</div>
                        <div style={{ color: "#64748b", fontSize: 11.5 }} className="truncate">{c.title || "-"}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <Empty text="Doğrudan bağlı kişi yok." />
              )}
            </Section>

            {parent ? (
              <Section title="Akranlar">
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 6 }}>
                  {(parent.children || [])
                    .filter((p) => String(p.id) !== String(person.id))
                    .map((p) => (
                      <li key={p.id} style={{ display: "flex", gap: 8, alignItems: "center", border: "1px solid #e2e8f0", borderRadius: 10, padding: 8 }}>
                        <img src={p.photo} alt={p.full_name} style={{ width: 34, height: 34, borderRadius: 8, objectFit: "cover" }} />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 12.5 }} className="truncate">{p.full_name}</div>
                          <div style={{ color: "#64748b", fontSize: 11.5 }} className="truncate">{p.title || "-"}</div>
                        </div>
                      </li>
                    ))}
                </ul>
              </Section>
            ) : null}
          </>
        ) : (
          <Empty text="Grafikten bir kişi seçin." />
        )}
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section style={{ marginBottom: 12 }}>
      <div style={{ fontWeight: 700, marginBottom: 6, color: "#0f172a", fontSize: 13.5 }}>{title}</div>
      {children}
    </section>
  );
}

function SmallStat({ label, value }) {
  return (
    <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: "6px 10px", minWidth: 80 }}>
      <div style={{ fontSize: 11, color: "#64748b" }}>{label}</div>
      <div style={{ fontWeight: 800, fontSize: 14 }}>{value}</div>
    </div>
  );
}

function Empty({ text }) {
  return <div style={{ fontSize: 12.5, color: "#94a3b8" }}>{text}</div>;
}

/* ---------------- İÇ BİLEŞEN ---------------- */
function OrgChartInner() {
  const [raw, setRaw] = useState([]);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [query, setQuery] = useState("");
  const [direction, setDirection] = useState("TB"); // TB | LR
  const [selected, setSelected] = useState(null);
  const selectedIdRef = useRef(null);
  const collapseRef = useRef(new Set());
  const rfContainerRef = useRef(null);
  const rfInstanceRef = useRef(null);

  const nodeTypes = useMemo(() => ({
    card: (props) => <NodeCard {...props} selected={String(props.id) === String(selectedIdRef.current)} />,
  }), []);

  // API + fallback
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/v1/org/employees/tree/");
        if (!r.ok) throw new Error(`status ${r.status}`);
        const data = await r.json();
        setRaw(Array.isArray(data) && data.length ? data : sampleData);
      } catch {
        setRaw(sampleData);
      }
    })();
  }, []);

  const fit = () => rfInstanceRef.current?.fitView({ padding: 0.15 });

  const buildGraph = useCallback(
    (trees) => {
      const n = [];
      const e = [];

      const walk = (node) => {
        const id = String(node.id);
        const collapsed = collapseRef.current.has(id);
        const isSelected = String(selectedIdRef.current) === id;

        n.push({
          id,
          type: "card",
          data: {
            full_name: node.full_name,
            title: node.title,
            department_name: node.department_name,
            photo: node.photo,
            collapsed,
            toggle: () => {
              if (collapsed) collapseRef.current.delete(id);
              else collapseRef.current.add(id);
              const g = buildGraph(raw);
              const positioned = layout(g.nodes, g.edges, direction);
              setNodes(positioned);
              setEdges(g.edges);
              setTimeout(fit, 0);
            },
          },
          position: { x: 0, y: 0 },
          style: isSelected ? { zIndex: 2 } : undefined,
        });

        if (!collapsed && Array.isArray(node.children)) {
          for (const child of node.children) {
            e.push({
              id: `${id}-${child.id}`,
              source: id,
              target: String(child.id),
              type: "smoothstep",
              animated: false,
              style: { stroke: "#cbd5e1", strokeWidth: 1.6 },
              markerEnd: { type: MarkerType.ArrowClosed, width: 14, height: 14, color: "#cbd5e1" },
            });
            walk(child);
          }
        }
      };

      for (const root of trees) walk(root);
      return { nodes: n, edges: e };
    },
    [raw, direction, setNodes, setEdges]
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return raw;
    const q = query.toLowerCase();
    const matchOrChildren = (node) => {
      const selfMatch =
        (node.full_name || "").toLowerCase().includes(q) ||
        (node.title || "").toLowerCase().includes(q) ||
        (node.department_name || "").toLowerCase().includes(q);
      const kids = (node.children || []).map(matchOrChildren).filter(Boolean);
      return selfMatch || kids.length ? { ...node, children: kids } : null;
    };
    return raw.map(matchOrChildren).filter(Boolean);
  }, [raw, query]);

  useEffect(() => {
    const g = buildGraph(filtered);
    const positioned = layout(g.nodes, g.edges, direction);
    setNodes(positioned);
    setEdges(g.edges);
    setTimeout(fit, 0);
  }, [filtered, direction, buildGraph, setNodes, setEdges]);

  const downloadPng = async () => {
    const { toPng } = await import("html-to-image");
    const pane = rfContainerRef.current?.querySelector(".react-flow__viewport");
    if (!pane) return;
    const dataUrl = await toPng(pane);
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "orgchart.png";
    a.click();
  };

  const onNodeClick = useCallback((_, node) => {
    const item = findInTrees(raw, node.id);
    setSelected(item);
    selectedIdRef.current = node.id;
    rfInstanceRef.current?.setCenter(
      node.positionAbsolute.x + NODE_W / 2,
      node.positionAbsolute.y + NODE_H / 2,
      { zoom: 1, duration: 240 }
    );
  }, [raw]);

  const closePanel = useCallback(() => {
    setSelected(null);
    selectedIdRef.current = null;
  }, []);

  return (
    <div style={{ height: "100vh", width: "100vw", background: "#f3f6f9", overflow: "hidden" }}>
      {/* sabit header */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: HEADER_H, zIndex: 50, background: "#fff", borderBottom: "1px solid #e5e7eb" }}>
        <AkademiBaseHeader />
      </div>

      {/* içerik alanı tam sayfa */}
      <div style={{ position: "absolute", top: HEADER_H, left: 0, right: 0, bottom: 0, display: "flex" }}>
        {/* Sol taraf: toolbar + grafik */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Toolbar */}
          <div style={{ background: "#ffffff", borderBottom: "1px solid #e5e7eb", padding: 10, display: "flex", gap: 8, alignItems: "center", boxShadow: "0 2px 6px rgba(2,6,23,.04)", zIndex: 40 }}>
            <div style={{ fontWeight: 700, padding: "0 8px", color: "#0f172a" }}>Organizasyon Şeması</div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ara: isim / unvan / departman"
              style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "7px 10px", width: 280, marginLeft: "auto" }}
            />
            <button onClick={() => { setDirection((d) => (d === "TB" ? "LR" : "TB")); setTimeout(fit, 0); }} style={{ padding: "7px 10px", border: "1px solid #e5e7eb", borderRadius: 8, cursor: "pointer", background: "#fff" }}>
              Yön: {direction === "TB" ? "Dikey" : "Yatay"}
            </button>
            <button onClick={() => {
              collapseRef.current.clear();
              const g = buildGraph(filtered);
              const positioned = layout(g.nodes, g.edges, direction);
              setNodes(positioned);
              setEdges(g.edges);
              setTimeout(fit, 0);
            }} style={{ padding: "7px 10px", border: "1px solid #e5e7eb", borderRadius: 8, cursor: "pointer", background: "#fff" }}>
              Hepsini Aç
            </button>
            <button onClick={() => {
              const allIds = new Set(nodes.map((n) => n.id));
              const rootIds = new Set((raw || []).map((r) => String(r.id)));
              collapseRef.current = allIds;
              for (const rid of rootIds) collapseRef.current.delete(rid);
              const g = buildGraph(filtered);
              const positioned = layout(g.nodes, g.edges, direction);
              setNodes(positioned);
              setEdges(g.edges);
              setTimeout(fit, 0);
            }} style={{ padding: "7px 10px", border: "1px solid #e5e7eb", borderRadius: 8, cursor: "pointer", background: "#fff" }}>
              Hepsini Kapat
            </button>
            <button onClick={downloadPng} style={{ padding: "7px 10px", border: "1px solid #e5e7eb", borderRadius: 8, cursor: "pointer", background: "#fff" }}>
              PNG
            </button>
          </div>

          {/* GRAPH */}
          <div style={{ flex: 1, position: "relative" }}>
            <div ref={rfContainerRef} style={{ width: "100%", height: "100%", overflow: "hidden" }}>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                nodeTypes={nodeTypes}
                onInit={(inst) => { rfInstanceRef.current = inst; setTimeout(fit, 0); }}
                fitView
                fitViewOptions={{ padding: 0.15 }}
                style={{ width: "100%", height: "100%" }}
              >
                <MiniMap nodeStrokeColor={() => "#334155"} nodeColor={() => "#e2e8f0"} nodeBorderRadius={8} maskColor="rgba(148,163,184,0.08)" />
                <Controls />
                <Background variant="dots" gap={22} size={1.4} color="#e5e7eb" />
              </ReactFlow>
            </div>
          </div>
        </div>

        {/* Sağ Panel (docked) */}
        <div style={{ width: PANEL_W, borderLeft: "1px solid #e5e7eb", background: "#fff", height: "100%" }}>
          <PersonPanel person={selected} trees={raw} />
          {/* İsteğe bağlı: bir Kapat butonu istersen */}
          {selected && (
            <div style={{ padding: 12, borderTop: "1px solid #f1f5f9" }}>
              <button onClick={closePanel} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer" }}>Seçimi Temizle</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- TEK DEFAULT EXPORT ---------------- */
export default function OrgChart() {
  return (
    <ReactFlowProvider>
      <OrgChartInner />
    </ReactFlowProvider>
  );
}
