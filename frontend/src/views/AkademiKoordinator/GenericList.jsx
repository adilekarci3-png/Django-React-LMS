// src/components/GenericList.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaSearch, FaPlus, FaEdit, FaTrash } from "react-icons/fa";

export default function GenericList({
  title,
  fetchUrl,
  columns,
  createLabel = "Ekle",
  onCreate,
  onEdit,
  onDelete,
  queryParamName = "q",
  pageParamName = "page",
  transformResponse,
  api,
  refreshEventName = "refresh-list", // 👈 eklendi
}) {
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const abortRef = useRef(null);

  const useDebounce = (value, delay) => {
    const [d, setD] = useState(value);
    useEffect(() => {
      const t = setTimeout(() => setD(value), delay);
      return () => clearTimeout(t);
    }, [value, delay]);
    return d;
  };
  const debouncedQ = useDebounce(q, 400);

  const buildUrl = useMemo(() => {
    const qp = new URLSearchParams();
    if (debouncedQ) qp.set(queryParamName, debouncedQ);
    if (page > 1) qp.set(pageParamName, String(page));
    const suffix = qp.toString() ? (fetchUrl.includes("?") ? "&" : "?") + qp.toString() : "";
    return fetchUrl + suffix;
  }, [fetchUrl, debouncedQ, page, queryParamName, pageParamName]);

  const refresh = async (controller) => {
    setLoading(true);
    try {
      const { data } = await api.get(buildUrl, { signal: controller.signal });
      if (transformResponse) {
        const { items, count } = transformResponse(data);
        setItems(items || []);
        setCount(count || 0);
      } else {
        setItems(Array.isArray(data) ? data : (data?.results || []));
        setCount(data?.count ?? (Array.isArray(data) ? data.length : 0));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;
    refresh(controller);
    return () => controller.abort();
  }, [buildUrl]); // q/page/dependency değiştiğinde fetch

  // 👇 Düzenle/Sil vs sonrası dışarıdan yenilemek için
  useEffect(() => {
    const handler = () => {
      const c = new AbortController();
      abortRef.current = c;
      refresh(c);
    };
    window.addEventListener(refreshEventName, handler);
    return () => window.removeEventListener(refreshEventName, handler);
  }, [refreshEventName]); // eslint-disable-line

  const pageSize = 10; // DRF page_size ile eşleştirebilirsin
  const totalPages = Math.max(1, Math.ceil((count || 0) / pageSize));

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body">
        <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between mb-3">
          <h4 className="m-0">{title}</h4>
          <div className="d-flex gap-2">
            <div className="input-group" style={{ maxWidth: 360 }}>
              <span className="input-group-text"><FaSearch /></span>
              <input
                className="form-control"
                placeholder="Ara…"
                value={q}
                onChange={(e) => { setPage(1); setQ(e.target.value); }}
              />
            </div>
            {onCreate && (
              <button className="btn btn-primary" onClick={onCreate}>
                <FaPlus className="me-1" /> {createLabel}
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="py-5 text-center text-muted">Yükleniyor…</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  {columns.map((c) => <th key={c.key}>{c.title}</th>)}
                  {(onEdit || onDelete) && <th style={{ width: 160 }}>İşlemler</th>}
                </tr>
              </thead>
              <tbody>
                {items.map((row) => (
                  <tr key={row.id}>
                    {columns.map((c) => (
                      <td key={c.key}>
                        {c.render ? c.render(row[c.key], row) : (row[c.key] ?? "-")}
                      </td>
                    ))}
                    {(onEdit || onDelete) && (
                      <td>
                        <div className="d-flex gap-2 flex-wrap">
                          {onEdit && (
                            <button className="btn btn-sm btn-outline-secondary" onClick={() => onEdit(row)}>
                              <FaEdit className="me-1" /> Düzenle
                            </button>
                          )}
                          {onDelete && (
                            <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(row)}>
                              <FaTrash className="me-1" /> Sil
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {!items.length && (
                  <tr>
                    <td colSpan={columns.length + ((onEdit || onDelete) ? 1 : 0)} className="text-center text-muted py-4">
                      Kayıt bulunamadı.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="d-flex justify-content-end align-items-center gap-2">
            <button className="btn btn-sm btn-outline-secondary" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Önceki</button>
            <span className="text-muted small">Sayfa {page} / {totalPages}</span>
            <button className="btn btn-sm btn-outline-secondary" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Sonraki</button>
          </div>
        )}
      </div>
    </div>
  );
}
