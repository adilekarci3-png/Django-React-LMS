// src/components/partials/Proje/ProjeFileTab.jsx
import React from "react";
import { FiFileText, FiExternalLink, FiDownload } from "react-icons/fi";

function ProjeFileTab({ curriculum = [], lectures = [] }) {
  const hasCurriculum = Array.isArray(curriculum) && curriculum.length > 0;
  const hasLectures   = Array.isArray(lectures) && lectures.length > 0;

  const safeUrl = (f) => {
    if (!f) return "#";
    if (typeof f === "string") return f;
    return f.file || f.url || "#";
  };

  const fileTitle = (item, fallback) =>
    item?.title || item?.variant?.title || fallback;

  const fileName = (f) => {
    if (!f) return undefined;
    if (typeof f === "string") {
      try {
        const u = new URL(f);
        return decodeURIComponent(u.pathname.split("/").pop());
      } catch {
        // string ama URL değilse düz döndürmeyelim (uzun olabilir)
        return undefined;
      }
    }
    return f.filename || f.name || (typeof f.file === "string" ? f.file.split("/").pop() : undefined);
  };

  if (!hasCurriculum && !hasLectures) {
    return <p>Bu projeye ait PDF bulunamadı.</p>;
  }

  return (
    <div className="row">
      {/* ---- Curriculum Bölümleri ---- */}
      {hasCurriculum &&
        curriculum.map((section, si) => {
          const title = section?.title || `Bölüm ${si + 1}`;
          const variantItems = Array.isArray(section?.variant_items) ? section.variant_items : [];
          const items        = Array.isArray(section?.items) ? section.items : [];
          const selfFile     = section?.file ? [{ file: section.file, title: title }] : [];

          const allFiles = [
            ...variantItems.map((it, i) => ({ ...it, __key: `vi-${si}-${i}` })),
            ...items.map((it, i) => ({ ...it, __key: `it-${si}-${i}` })),
            ...selfFile.map((it, i) => ({ ...it, __key: `sf-${si}-${i}` })),
          ];

          return (
            <div key={section?.id || `sec-${si}`} className="mb-4">
              <h5 className="mb-3">{title}</h5>

              {allFiles.length === 0 && (
                <div className="text-muted">Bu bölümde PDF dosyası yok.</div>
              )}

              {allFiles.map((item, ii) => {
                const url = safeUrl(item);
                const label = fileTitle(item, `${title} - Dosya ${ii + 1}`);
                const fname = fileName(item);

                return (
                  <div key={item.__key || item.id || `f-${si}-${ii}`} className="card mb-3 shadow-sm">
                    <div className="card-body d-flex flex-wrap align-items-center justify-content-between gap-2">
                      <div className="d-flex align-items-center gap-2">
                        <span className="text-muted"><FiFileText /></span>
                        <div>
                          <p className="fw-bold mb-0">{label}</p>
                          {fname && <small className="text-muted">{fname}</small>}
                        </div>
                      </div>

                      {url && url !== "#" ? (
                        <div className="d-flex gap-2">
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
                            title="Yeni sekmede aç"
                          >
                            <FiExternalLink /> Önizle
                          </a>
                          <a
                            href={url}
                            download={fname}
                            className="btn btn-primary btn-sm d-flex align-items-center gap-1"
                            title="İndir"
                          >
                            <FiDownload /> İndir
                          </a>
                        </div>
                      ) : (
                        <span className="text-muted">PDF dosyası yok</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}

      {/* ---- Lectures ---- */}
      {hasLectures && (
        <div className="mb-4">
          <h5 className="mb-3">Ders Dosyaları</h5>
          {lectures.map((lec, li) => {
            const url = safeUrl(lec);
            const label = lec?.title || `Ders ${li + 1}`;
            const fname = fileName(lec);

            return (
              <div key={lec?.id || `lec-${li}`} className="card mb-3 shadow-sm">
                <div className="card-body d-flex flex-wrap align-items-center justify-content-between gap-2">
                  <div className="d-flex align-items-center gap-2">
                    <span className="text-muted"><FiFileText /></span>
                    <div>
                      <p className="fw-bold mb-0">{label}</p>
                      {fname && <small className="text-muted">{fname}</small>}
                    </div>
                  </div>

                  {url && url !== "#" ? (
                    <div className="d-flex gap-2">
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
                        title="Yeni sekmede aç"
                      >
                        <FiExternalLink /> Önizle
                      </a>
                      <a
                        href={url}
                        download={fname}
                        className="btn btn-primary btn-sm d-flex align-items-center gap-1"
                        title="İndir"
                      >
                        <FiDownload /> İndir
                      </a>
                    </div>
                  ) : (
                    <span className="text-muted">PDF dosyası yok</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ProjeFileTab;
