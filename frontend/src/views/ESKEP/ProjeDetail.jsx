// src/components/Student/ProjeDetail.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import useAxios from "../../utils/useAxios";
import useUserData from "../plugin/useUserData";

import Header from "./Partials/Header";
import Sidebar from "./Partials/Sidebar";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";
import EskepProjeStatusTab from "../partials/EskepProjeDetails/EskepProjeStatusTab";
import EskepProjeFileTab from "../partials/EskepProjeDetails/EskepProjeFileTab";
import EskepProjeNotesTab from "../partials/EskepProjeDetails/EskepProjeNotesTab";
import EskepProjeChatTab from "../partials/EskepProjeDetails/EskepProjeChatTab";
import EskepProjeReviewTab from "../partials/EskepProjeDetails/EskepProjeReviewTab";

// Proje sekmeleri


// Basit PDF listesi sekmesi (OdevFileTab benzeri, projeye özel)
function ProjeFileTab({ curriculum = [], lectures = [] }) {
  // Tüm olası kaynaklardan dosyaları topla
  const files = useMemo(() => {
    const out = [];

    // curriculum[].variant_items[]
    (Array.isArray(curriculum) ? curriculum : []).forEach((c, ci) => {
      (Array.isArray(c?.variant_items) ? c.variant_items : []).forEach((vi, i) => {
        out.push({
          key: `cur-var-${ci}-${i}`,
          title: vi?.title || c?.title || `Bölüm ${(ci + 1)}.${(i + 1)}`,
          file: vi?.file ?? vi?.url ?? vi,
          filename: vi?.filename,
          variant: vi?.variant,
        });
      });
    });

    // curriculum[].items[]
    (Array.isArray(curriculum) ? curriculum : []).forEach((c, ci) => {
      (Array.isArray(c?.items) ? c.items : []).forEach((it, i) => {
        out.push({
          key: `cur-item-${ci}-${i}`,
          title: it?.title || c?.title || `Bölüm ${(ci + 1)}.${(i + 1)}`,
          file: it?.file ?? it?.url ?? it,
          filename: it?.filename,
          variant: it?.variant,
        });
      });
    });

    // lectures[]
    (Array.isArray(lectures) ? lectures : []).forEach((lec, li) => {
      out.push({
        key: `lec-${li}`,
        title: lec?.title || `Ders ${li + 1}`,
        file: lec?.file ?? lec?.url ?? lec,
        filename: lec?.filename,
        variant: lec?.variant,
      });
    });

    // curriculum öğesinin bizzat file'ı varsa (nadir)
    (Array.isArray(curriculum) ? curriculum : []).forEach((c, ci) => {
      if (c?.file) {
        out.push({
          key: `cur-self-${ci}`,
          title: c?.title || `Bölüm ${ci + 1}`,
          file: c.file,
          filename: c?.filename,
          variant: c?.variant,
        });
      }
    });

    return out;
  }, [curriculum, lectures]);

  if (!files.length) {
    return <div className="alert alert-light">Henüz eklenmiş PDF yok.</div>;
  }

  const safeUrl = (f) => (typeof f === "string" ? f : f?.url ?? f?.file ?? "#");
  const fileTitle = (f, i) => f?.title || f?.variant?.title || `Bölüm ${i + 1}`;
  const fileName = (f) => (typeof f === "string" ? undefined : f?.filename || f?.name);

  return (
    <div className="list-group">
      {files.map((f, idx) => (
        <a
          key={f.key}
          href={safeUrl(f.file)}
          target="_blank"
          rel="noopener noreferrer"
          className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
        >
          <span>{fileTitle(f, idx)}</span>
          <small className="text-muted">{fileName(f) || "PDF'yi aç"}</small>
        </a>
      ))}
    </div>
  );
}

function ProjeDetail() {
  const { id } = useParams();
  const user = useUserData();
  const [data, setData] = useState(null);
  const [studentReview, setStudentReview] = useState(null);

  const fetchDetail = async () => {
    try {
      // ODEVDETAY ile aynı kalıp: /eskepstajer/proje-detail/<user>/<id>/
      const res = await useAxios().get(
        `eskepstajer/proje-detail/${user?.user_id}/${id}/`
      );
      setData(res.data);
      setStudentReview(res.data?.review || null);
    } catch (err) {
      console.error("Proje detay alınamadı", err);
    }
  };

  useEffect(() => {
    if (user?.user_id && id) fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.user_id, id]);

  return (
    <>
      <ESKEPBaseHeader />
      <section className="pt-5 pb-5">
        <div className="container">
          <Header />
          <div className="row mt-0 mt-md-4">
            <Sidebar />
            <div className="col-lg-10 col-md-8 col-12">
              {/* ÖZET PANEL */}
              <div className="border rounded bg-light p-4 mb-4">
                <h3 className="mb-3">{data?.title || "Proje Başlığı"}</h3>
                <p><strong>Açıklama:</strong> {data?.description || "—"}</p>
                <p><strong>Dil:</strong> {data?.language || "—"}</p>
                <p><strong>Seviye:</strong> {data?.level || "—"}</p>
                <p>
                  <strong>Ekleyen:</strong> {data?.inserteduser?.full_name || "—"}{" "}
                  ({data?.inserteduser?.email || "—"})
                </p>
                <p>
                  <strong>Oluşturulma:</strong>{" "}
                  {data?.date ? new Date(data.date).toLocaleString("tr-TR") : "—"}
                </p>
              </div>

              {/* SEKME YAPISI (OdevDetail ile aynı görünüm) */}
              <section className="mt-4">
                <div className="card shadow rounded-2 p-4">
                  <ul className="nav nav-tabs mb-4" id="projeTabs" role="tablist">
                    <li className="nav-item" role="presentation">
                      <button
                        className="nav-link active"
                        id="proje-tab-status"
                        data-bs-toggle="tab"
                        data-bs-target="#proje-pane-status"
                        type="button"
                        role="tab"
                      >
                        Durum
                      </button>
                    </li>

                    <li className="nav-item" role="presentation">
                      <button
                        className="nav-link"
                        id="proje-tab-pdfs"
                        data-bs-toggle="tab"
                        data-bs-target="#proje-pane-pdfs"
                        type="button"
                        role="tab"
                      >
                        PDF Dosyaları
                      </button>
                    </li>

                    <li className="nav-item" role="presentation">
                      <button
                        className="nav-link"
                        id="proje-tab-notes"
                        data-bs-toggle="tab"
                        data-bs-target="#proje-pane-notes"
                        type="button"
                        role="tab"
                      >
                        Notlar
                      </button>
                    </li>

                    <li className="nav-item" role="presentation">
                      <button
                        className="nav-link"
                        id="proje-tab-chat"
                        data-bs-toggle="tab"
                        data-bs-target="#proje-pane-chat"
                        type="button"
                        role="tab"
                      >
                        Konuşma
                      </button>
                    </li>

                    <li className="nav-item" role="presentation">
                      <button
                        className="nav-link"
                        id="proje-tab-review"
                        data-bs-toggle="tab"
                        data-bs-target="#proje-pane-review"
                        type="button"
                        role="tab"
                      >
                        Not Ver
                      </button>
                    </li>
                  </ul>

                  <div className="tab-content" id="projeTabContent">
                    <div
                      className="tab-pane fade show active"
                      id="proje-pane-status"
                      role="tabpanel"
                      aria-labelledby="proje-tab-status"
                    >
                      <EskepProjeStatusTab eskepproje={data} />
                    </div>

                    <div
                      className="tab-pane fade"
                      id="proje-pane-pdfs"
                      role="tabpanel"
                      aria-labelledby="proje-tab-pdfs"
                    >
                      <EskepProjeFileTab
                        curriculum={data?.curriculum}
                        lectures={data?.lectures}
                      />
                    </div>

                    <div
                      className="tab-pane fade"
                      id="proje-pane-notes"
                      role="tabpanel"
                      aria-labelledby="proje-tab-notes"
                    >
                      <EskepProjeNotesTab
                        eskepproje={data}
                        id={id}
                        fetchDetail={fetchDetail}
                      />
                    </div>

                    <div
                      className="tab-pane fade"
                      id="proje-pane-chat"
                      role="tabpanel"
                      aria-labelledby="proje-tab-chat"
                    >
                      {data && (
                        <EskepProjeChatTab
                          eskepproje={data}
                          fetchEskepProjeDetail={fetchDetail}
                        />
                      )}
                    </div>

                    <div
                      className="tab-pane fade"
                      id="proje-pane-review"
                      role="tabpanel"
                      aria-labelledby="proje-tab-review"
                    >
                      <EskepProjeReviewTab
                        eskepproje={data}
                        studentReview={studentReview}
                        fetchDetail={fetchDetail}
                      />
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>
      <ESKEPBaseFooter />
    </>
  );
}

export default ProjeDetail;
