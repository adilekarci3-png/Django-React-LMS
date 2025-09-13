// src/views/base/OrgChart.jsx
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

import AkademiBaseFooter from "../partials/AkademiBaseFooter";
import AkademiBaseHeader from "../partials/AkademiBaseHeader";

/* ==== boyutlar ==== */
const NODE_W = 300;
const NODE_H = 110;
const AVATAR = 60;

/* departmana göre renk */
function deptColor(name = "") {
  const n = name.toLowerCase();
  if (n.includes("yönetim")) return "#2563eb";         // mavi
  if (n.includes("mühendis")) return "#16a34a";        // yeşil
  if (n.includes("sekreter")) return "#f59e0b";        // amber
  if (n.includes("insan kaynak")) return "#9333ea";    // mor
  if (n.includes("mali")) return "#0ea5e9";            // cyan
  if (n.includes("eğitim")) return "#ef4444";          // kırmızı
  return "#64748b";                                    // slate
}

/* ---------------- MOCK DATA ---------------- */
const sampleData = [
  {
    id: 1,
    full_name: "Ali Özdemir",
    title: "EHAD Başkanı",
    department: 1,
    department_name: "Yönetim",
    photo: hafiz1,
    children: [
      {
        id: 2,
        full_name: "Mustafa Yılmaz",
        title: "EHAD Genel Sekreter",
        department: 2,
        department_name: "Sekreter",
        photo: hafiz2,
        children: [
          { id: 3, full_name: "İsa Güler", title: "İnsan Kaynakları Müdürü", department: 2, department_name: "İnsan Kaynakları", photo: hafiz3, children: [] },
          { id: 4, full_name: "Adile Karci", title: "Bilgisayar Mühendisi", department: 2, department_name: "Mühendislik", photo: hafizHanim1, children: [] },
          { id: 7, full_name: "Furkan Kiraz", title: "Bilgisayar Mühendisi", department: 2, department_name: "Mühendislik", photo: hafiz2, children: [] },
          { id: 8, full_name: "Mehmet Emre Cebeci", title: "Bilgisayar Mühendisi", department: 2, department_name: "Mühendislik", photo: hafiz1, children: [] },
          { id: 9, full_name: "Recep Kepenek", title: "Bilgisayar Mühendisi", department: 2, department_name: "Mühendislik", photo: hafiz1, children: [] },
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
// id ile düğümü bul
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

// kökten hedefe yol (breadcrumb)
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

/* ---------------- DAGRE LAYOUT ---------------- */
function layout(nodes, edges, direction = "TB") {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: direction, nodesep: 48, ranksep: 96 });
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
        borderRadius: 16,
        background: "#fff",
        border: selected ? `2px solid ${accent}` : "1px solid #cbd5e1",
        boxShadow: selected
          ? `0 10px 30px ${accent}33`
          : "0 8px 24px rgba(15,23,42,.10)",
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: 12,
        transition: "box-shadow .2s, border-color .2s",
      }}
    >
      <span
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 6,
          borderTopLeftRadius: 16,
          borderBottomLeftRadius: 16,
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
          border: "2px solid #e2e8f0",
          flex: "0 0 auto",
        }}
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 16, lineHeight: "20px" }} className="truncate">
          {full_name}
        </div>
        <div style={{ color: "#475569", fontSize: 13 }} className="truncate">
          {title || ""}
        </div>
        {department_name && (
          <span
            title={department_name}
            style={{
              marginTop: 6,
              display: "inline-block",
              fontSize: 11,
              padding: "2px 8px",
              borderRadius: 999,
              background: `${accent}1A`,
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
          fontSize: 14,
          width: 28,
          height: 28,
          lineHeight: "24px",
          borderRadius: 8,
          border: "1px solid #cbd5e1",
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

/* ---------------- sağ panel ---------------- */
function PersonPanel({ open, onClose, person, trees }) {
  const path = useMemo(() => (person ? pathToId(trees, person.id) : []), [person, trees]);
  const root = path[0];
  const parent = path.length > 1 ? path[path.length - 2] : null;

  // counts
  const directReports = (person?.children || []).length;
  const peers = parent ? (parent.children || []).length - 1 : 0;

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const width = 380;

  return (
    <>
      {/* overlay */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: open ? "rgba(2,6,23,0.25)" : "transparent",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity .2s",
          zIndex: 30,
        }}
      />

      {/* drawer */}
      <aside
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100vh",
          width,
          background: "#ffffff",
          borderLeft: "1px solid #e5e7eb",
          boxShadow: "0 0 40px rgba(2,6,23,.15)",
          transform: open ? "translateX(0)" : `translateX(${width}px)`,
          transition: "transform .25s ease",
          zIndex: 31,
          display: "grid",
          gridTemplateRows: "auto auto 1fr",
        }}
        aria-hidden={!open}
      >
        {/* header */}
        <div style={{ display: "flex", alignItems: "center", padding: 14, gap: 10 }}>
          <strong style={{ fontSize: 16 }}>Kişi Bilgisi</strong>
          <div style={{ marginLeft: "auto" }}>
            <button
              onClick={onClose}
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                background: "#fff",
                cursor: "pointer",
              }}
              title="Kapat (Esc)"
            >
              ✕
            </button>
          </div>
        </div>

        {/* kişi üst kartı */}
        {person ? (
          <div style={{ padding: "0 16px 12px", borderBottom: "1px solid #f1f5f9" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <img
                src={person.photo}
                alt={person.full_name}
                style={{ width: 72, height: 72, borderRadius: 12, objectFit: "cover", border: "1px solid #e2e8f0" }}
              />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 18 }} className="truncate">{person.full_name}</div>
                <div style={{ color: "#475569", fontSize: 13 }} className="truncate">{person.title || "-"}</div>
                {person.department_name && (
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 11,
                      display: "inline-block",
                      padding: "2px 8px",
                      borderRadius: 999,
                      border: `1px solid ${deptColor(person.department_name)}`,
                      color: deptColor(person.department_name),
                    }}
                    className="truncate"
                    title={person.department_name}
                  >
                    {person.department_name}
                  </div>
                )}
              </div>
            </div>

            {/* breadcrumb */}
            <div style={{ marginTop: 10, fontSize: 12, color: "#64748b" }}>
              {path.map((n, i) => (
                <span key={n.id}>
                  {i > 0 && " / "}
                  {n.full_name}
                </span>
              ))}
            </div>

            {/* kısa istatistik */}
            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
              <SmallStat label="Bağlı" value={parent ? parent.full_name : "—"} />
              <SmallStat label="Ekip" value={`${directReports}`} />
              <SmallStat label="Akran" value={`${Math.max(peers, 0)}`} />
            </div>
          </div>
        ) : null}

        {/* içerik */}
        <div style={{ overflow: "auto", padding: 16 }}>
          {person ? (
            <>
              {/* Doğrudan bağlılar */}
              <Section title="Doğrudan Raporlayanlar">
                {person.children && person.children.length > 0 ? (
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
                    {person.children.map((c) => (
                      <li key={c.id} style={{
                        display: "flex", gap: 10, alignItems: "center",
                        border: "1px solid #e2e8f0", borderRadius: 10, padding: 8
                      }}>
                        <img src={c.photo} alt={c.full_name} style={{ width: 38, height: 38, borderRadius: 8, objectFit: "cover" }} />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 13 }} className="truncate">{c.full_name}</div>
                          <div style={{ color: "#64748b", fontSize: 12 }} className="truncate">{c.title || "-"}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <Empty text="Doğrudan bağlı kişi yok." />
                )}
              </Section>

              {/* Akranlar */}
              <Section title="Akranlar">
                {parent ? (
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
                    {(parent.children || [])
                      .filter((p) => String(p.id) !== String(person.id))
                      .map((p) => (
                        <li key={p.id} style={{
                          display: "flex", gap: 10, alignItems: "center",
                          border: "1px solid #e2e8f0", borderRadius: 10, padding: 8
                        }}>
                          <img src={p.photo} alt={p.full_name} style={{ width: 38, height: 38, borderRadius: 8, objectFit: "cover" }} />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: 13 }} className="truncate">{p.full_name}</div>
                            <div style={{ color: "#64748b", fontSize: 12 }} className="truncate">{p.title || "-"}</div>
                          </div>
                        </li>
                      ))}
                  </ul>
                ) : <Empty text="Kök düğüm, akranı yok." />}
              </Section>

              {/* Not: buraya iletişim/etiketler/linkler gibi alanlar kolayca eklenebilir */}
            </>
          ) : (
            <Empty text="Bir kişiyi görmek için grafikten bir node seçin." />
          )}
        </div>
      </aside>
    </>
  );
}

function Section({ title, children }) {
  return (
    <section style={{ marginBottom: 16 }}>
      <div style={{ fontWeight: 700, marginBottom: 8, color: "#0f172a" }}>{title}</div>
      {children}
    </section>
  );
}

function SmallStat({ label, value }) {
  return (
    <div style={{
      border: "1px solid #e2e8f0",
      borderRadius: 10,
      padding: "6px 10px",
      minWidth: 90
    }}>
      <div style={{ fontSize: 11, color: "#64748b" }}>{label}</div>
      <div style={{ fontWeight: 800, fontSize: 14 }}>{value}</div>
    </div>
  );
}

function Empty({ text }) {
  return <div style={{ fontSize: 13, color: "#94a3b8" }}>{text}</div>;
}

/* ---------------- İÇ BİLEŞEN ---------------- */
function OrgChartInner() {
  const [raw, setRaw] = useState([]);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [query, setQuery] = useState("");
  const [direction, setDirection] = useState("TB"); // TB | LR
  const [selected, setSelected] = useState(null);   // seçili kişi (obje)
  const selectedIdRef = useRef(null);               // node vurgusu için
  const collapseRef = useRef(new Set());
  const rfContainerRef = useRef(null);
  const rfInstanceRef = useRef(null);

  const nodeTypes = useMemo(() => ({
    card: (props) => <NodeCard {...props} selected={String(props.id) === String(selectedIdRef.current)} />
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

  const fit = () => rfInstanceRef.current?.fitView({ padding: 0.2 });

  // ağaç -> nodes/edges
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
              style: { stroke: "#94a3b8", strokeWidth: 2 },
              markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18, color: "#94a3b8" },
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

  // arama
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

  // yerleşim + fit
  useEffect(() => {
    const g = buildGraph(filtered);
    const positioned = layout(g.nodes, g.edges, direction);
    setNodes(positioned);
    setEdges(g.edges);
    setTimeout(fit, 0);
  }, [filtered, direction, buildGraph, setNodes, setEdges]);

  // PNG export
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

  // node tıklama → panel aç
  const onNodeClick = useCallback((_, node) => {
    const item = findInTrees(raw, node.id);
    setSelected(item);
    selectedIdRef.current = node.id;
    // seçilen node’u merkeze getir (ufak animasyon)
    rfInstanceRef.current?.setCenter(node.positionAbsolute.x + NODE_W / 2, node.positionAbsolute.y + NODE_H / 2, {
      zoom: 1,
      duration: 300,
    });
  }, [raw]);

  // panel kapandığında vurguyu kaldır
  const closePanel = useCallback(() => {
    setSelected(null);
    selectedIdRef.current = null;
    // grafiği çok oynatma; istersen fitView yapabilirsin
  }, []);

  // Panel açıkken akış alanını daralt (padding-right)
  const rightPadding = selected ? 380 : 0;

  return (
    <div
      style={{
        height: "100vh",
        display: "grid",
        gridTemplateRows: "auto auto 1fr auto",
        background: "#f8fafc",
      }}
    >
      {/* Header */}
      <AkademiBaseHeader />

      {/* Toolbar */}
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid #e5e7eb",
          padding: 12,
          display: "flex",
          gap: 8,
          alignItems: "center",
        }}
      >
        <div style={{ fontWeight: 700, padding: "0 8px" }}>Organizasyon Şeması</div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ara: isim / unvan / departman"
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            padding: "8px 12px",
            width: 320,
            marginLeft: "auto",
          }}
        />
        <button
          onClick={() => {
            setDirection((d) => (d === "TB" ? "LR" : "TB"));
            setTimeout(fit, 0);
          }}
          style={{ padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, cursor: "pointer" }}
        >
          Yön: {direction === "TB" ? "Dikey" : "Yatay"}
        </button>
        <button
          onClick={() => {
            collapseRef.current.clear();
            const g = buildGraph(filtered);
            const positioned = layout(g.nodes, g.edges, direction);
            setNodes(positioned);
            setEdges(g.edges);
            setTimeout(fit, 0);
          }}
          style={{ padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, cursor: "pointer" }}
        >
          Hepsini Aç
        </button>
        <button
          onClick={() => {
            const allIds = new Set(nodes.map((n) => n.id));
            const rootIds = new Set((raw || []).map(r => String(r.id)));
            collapseRef.current = allIds;
            for (const rid of rootIds) collapseRef.current.delete(rid);
            const g = buildGraph(filtered);
            const positioned = layout(g.nodes, g.edges, direction);
            setNodes(positioned);
            setEdges(g.edges);
            setTimeout(fit, 0);
          }}
          style={{ padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, cursor: "pointer" }}
        >
          Hepsini Kapat
        </button>
        <button onClick={downloadPng} style={{ padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, cursor: "pointer" }}>
          PNG
        </button>
      </div>

      {/* GRAPH */}
      <div style={{ minHeight: 0 }}>
        <div ref={rfContainerRef} style={{ width: "100%", height: "100%", paddingRight: rightPadding }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            onInit={(inst) => {
              rfInstanceRef.current = inst;
              setTimeout(fit, 0);
            }}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            style={{ width: "100%", height: "100%" }}
          >
            <MiniMap
              nodeStrokeColor={() => "#334155"}
              nodeColor={() => "#e2e8f0"}
              nodeBorderRadius={8}
              maskColor="rgba(148,163,184,0.1)"
            />
            <Controls />
            <Background variant="dots" gap={24} size={1.6} color="#e5e7eb" />
          </ReactFlow>
        </div>
      </div>

      {/* <AkademiBaseFooter /> */}

      {/* Sağ Panel */}
      <PersonPanel open={!!selected} onClose={closePanel} person={selected} trees={raw} />
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
