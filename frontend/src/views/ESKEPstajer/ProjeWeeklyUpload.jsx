// src/pages/ESKEP/Stajer/ProjeWeeklyUpload.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";

import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import useAxios from "../../utils/useAxios";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";
import { FiPlus, FiCheckCircle, FiAlertTriangle } from "react-icons/fi";

function ProjeWeeklyUpload() {
  const { id } = useParams(); // proje id
  const api = useAxios();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedWeek, setSelectedWeek] = useState(null);
  const [working, setWorking] = useState(false);

  const [form, setForm] = useState({
    youtube_videos: [""],
    reels_videos: [""],
    instagram_square_images: [""],
    youtube_horizontal_images: [""],
  });

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .get(`eskepstajer/proje/${id}/`)
      .then((res) => setProject(res.data))
      .finally(() => setLoading(false));
  }, [api, id]);

  const planWeekCount = project?.plan_week_count || 5;
  const weeksData = Array.isArray(project?.weeks) ? project.weeks : [];

  const isWeekComplete = (weekNo) => {
    const w = weeksData.find((x) => x.week_no === weekNo);
    if (!w) return false;
    const ok1 = (w.youtube_videos || 0) >= 3;
    const ok2 = (w.reels_videos || 0) >= 3;
    const ok3 = (w.instagram_square_images || 0) >= 3;
    const ok4 = (w.youtube_horizontal_images || 0) >= 3;
    return ok1 && ok2 && ok3 && ok4;
  };

  const pushField = (field) => {
    setForm((prev) => ({
      ...prev,
      [field]: [...(prev[field] || []), ""],
    }));
  };

  const changeField = (field, idx, value) => {
    setForm((prev) => {
      const arr = [...(prev[field] || [])];
      arr[idx] = value;
      return { ...prev, [field]: arr };
    });
  };

  const handleSelectWeek = (weekNo) => {
    setSelectedWeek(weekNo);
    // seçilmeyen haftalar için formu sıfırla
    setForm({
      youtube_videos: [""],
      reels_videos: [""],
      instagram_square_images: [""],
      youtube_horizontal_images: [""],
    });
  };

  const handleSubmitWeek = async () => {
    if (!selectedWeek) {
      Swal.fire("Uyarı", "Önce bir hafta seçin", "warning");
      return;
    }

    // min 3 kontrolü
    const must3 = [
      "youtube_videos",
      "reels_videos",
      "instagram_square_images",
      "youtube_horizontal_images",
    ];
    for (const f of must3) {
      const valid = (form[f] || []).filter((x) => x && x.trim()).length;
      if (valid < 3) {
        Swal.fire(
          "Eksik Bilgi",
          `${f} alanında en az 3 içerik olmalı`,
          "error"
        );
        return;
      }
    }

    try {
      setWorking(true);
      await api.post(
        `eskepstajer/proje/${id}/week/${selectedWeek}/`,
        {
          week_no: selectedWeek,
          ...form,
        }
      );
      Swal.fire("Kaydedildi", "Haftalık içerik kaydedildi", "success");
      // tekrar yükle
      const fresh = await api.get(`eskepstajer/proje/${id}/`);
      setProject(fresh.data);
      setSelectedWeek(null);
    } catch (err) {
      console.error(err);
      Swal.fire("Hata", "Kayıt sırasında hata oluştu", "error");
    } finally {
      setWorking(false);
    }
  };

  return (
    <>
      <ESKEPBaseHeader />
      <section className="pt-5 pb-5">
        <div className="container">
          <Header />
          <div className="row mt-0 mt-md-4">
            <div className="col-lg-3 col-md-3 col-12 mb-4 mb-md-0">
              <Sidebar />
            </div>

            <div className="col-lg-9 col-md-9 col-12">
              {loading && <p>Yükleniyor...</p>}
              {!loading && !project && <p>Proje bulunamadı.</p>}

              {!loading && project && (
                <>
                  <h2 className="mb-2">
                    📅 Haftalık İçerik – {project.title}
                  </h2>
                  <p className="text-muted">
                    Bu proje {planWeekCount} haftalık içerik gerektiriyor. Her
                    haftada 4 tip içerik olacak ve her biri min 3 tane olacak.
                  </p>

                  {/* haftalar */}
                  <div className="row g-2 mb-4">
                    {Array.from({ length: planWeekCount }).map((_, i) => {
                      const weekNo = i + 1;
                      const done = isWeekComplete(weekNo);
                      return (
                        <div className="col-6 col-md-3" key={weekNo}>
                          <button
                            type="button"
                            onClick={() => handleSelectWeek(weekNo)}
                            className={`w-100 btn ${
                              selectedWeek === weekNo
                                ? "btn-primary"
                                : done
                                ? "btn-success"
                                : "btn-outline-secondary"
                            } d-flex flex-column py-3 gap-1`}
                          >
                            <span>Hafta {weekNo}</span>
                            {done ? (
                              <span className="small d-flex align-items-center justify-content-center gap-1">
                                <FiCheckCircle />
                                Tamamlandı
                              </span>
                            ) : (
                              <span className="small d-flex align-items-center justify-content-center gap-1">
                                <FiAlertTriangle />
                                Eksik
                              </span>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {!selectedWeek ? (
                    <div className="alert alert-info">
                      Düzenlemek / yüklemek için bir haftaya tıklayın.
                    </div>
                  ) : (
                    <div className="card mb-4">
                      <div className="card-body">
                        <h4>Hafta {selectedWeek} İçerikleri</h4>

                        {/* YouTube */}
                        <div className="mb-3">
                          <label className="form-label">
                            YouTube formatında video (min 3)
                          </label>
                          {form.youtube_videos.map((v, idx) => (
                            <input
                              key={idx}
                              className="form-control mb-2"
                              placeholder="https://youtube.com/..."
                              value={v}
                              onChange={(e) =>
                                changeField(
                                  "youtube_videos",
                                  idx,
                                  e.target.value
                                )
                              }
                            />
                          ))}
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => pushField("youtube_videos")}
                          >
                            <FiPlus className="me-1" />
                            Yeni link
                          </button>
                        </div>

                        {/* Reels */}
                        <div className="mb-3">
                          <label className="form-label">
                            Reels / dik video (min 3)
                          </label>
                          {form.reels_videos.map((v, idx) => (
                            <input
                              key={idx}
                              className="form-control mb-2"
                              placeholder="https://instagram.com/reel/..."
                              value={v}
                              onChange={(e) =>
                                changeField(
                                  "reels_videos",
                                  idx,
                                  e.target.value
                                )
                              }
                            />
                          ))}
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => pushField("reels_videos")}
                          >
                            <FiPlus className="me-1" />
                            Yeni link
                          </button>
                        </div>

                        {/* Instagram kare */}
                        <div className="mb-3">
                          <label className="form-label">
                            Instagram kare görsel (min 3)
                          </label>
                          {form.instagram_square_images.map((v, idx) => (
                            <input
                              key={idx}
                              className="form-control mb-2"
                              placeholder="Görsel linki / dosya yolu"
                              value={v}
                              onChange={(e) =>
                                changeField(
                                  "instagram_square_images",
                                  idx,
                                  e.target.value
                                )
                              }
                            />
                          ))}
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() =>
                              pushField("instagram_square_images")
                            }
                          >
                            <FiPlus className="me-1" />
                            Yeni görsel
                          </button>
                        </div>

                        {/* YouTube yatay görsel */}
                        <div className="mb-3">
                          <label className="form-label">
                            YouTube yatay görsel / kapak (min 3)
                          </label>
                          {form.youtube_horizontal_images.map((v, idx) => (
                            <input
                              key={idx}
                              className="form-control mb-2"
                              placeholder="Görsel linki / dosya yolu"
                              value={v}
                              onChange={(e) =>
                                changeField(
                                  "youtube_horizontal_images",
                                  idx,
                                  e.target.value
                                )
                              }
                            />
                          ))}
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() =>
                              pushField("youtube_horizontal_images")
                            }
                          >
                            <FiPlus className="me-1" />
                            Yeni görsel
                          </button>
                        </div>
                      </div>

                      <div className="card-footer d-flex justify-content-end gap-2">
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={handleSubmitWeek}
                          disabled={working}
                        >
                          {working ? "Kaydediliyor..." : "Haftayı Kaydet"}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
      <ESKEPBaseFooter />
    </>
  );
}

export default ProjeWeeklyUpload;
