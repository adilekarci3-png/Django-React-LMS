import React, { useEffect, useRef, useState } from "react";
import useAxios from "../../utils/useAxios";
import { useAuthStore } from "../../store/auth";
import Calendar from "react-calendar";
import HDMBaseHeader from "../partials/HDMBaseHeader";
import HDMBaseFooter from "../partials/HDMBaseFooter";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import Swal from "sweetalert2";
import "react-calendar/dist/Calendar.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./css/HafizTakip.css";

const HafizTakip = () => {
  const api = useAxios();

  // sub_roles içinde "HDMEgitmen" var mı? + kimlikler
  const [isHDMEgitmen, userId, teacherInStore] = useAuthStore((s) => [
    (s.allUserData?.sub_roles || []).some((r) => {
      const name = typeof r === "string" ? r : r?.name;
      return String(name).toLowerCase() === "hdmegitmen";
    }),
    s.allUserData?.user_id ?? s.allUserData?.id ?? null,
    s.allUserData?.teacher ?? null,
  ]);

  const [egitmen, setEgitmen] = useState(null); // { id, full_name }
  const [hafizlar, setHafizlar] = useState([]);
  const [hatalar, setHatalar] = useState([]);
  const [filteredHatalar, setFilteredHatalar] = useState([]);
  const [selectedHafizId, setSelectedHafizId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dersAtamalari, setDersAtamalari] = useState([]);
  const [loadingEgitmen, setLoadingEgitmen] = useState(true);

  // ⏰ saat seçimi (oluşturma)
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("11:00");

  // ✏️ düzenleme modalı
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editDate, setEditDate] = useState(new Date());
  const [editStartTime, setEditStartTime] = useState("10:00");
  const [editEndTime, setEditEndTime] = useState("11:00");
  const [editTopic, setEditTopic] = useState("");
  const [editAciklama, setEditAciklama] = useState("");

  const didInit = useRef(false);

  // helpers
  const pad2 = (n) => String(n).padStart(2, "0");
  const formatHHMM = (d) => `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  const formatDateInput = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  const parseDateInput = (val) => {
    const [y, m, day] = val.split("-").map(Number);
    return new Date(y, (m || 1) - 1, day || 1, 0, 0, 0, 0);
  };
  const combineDateAndTime = (dateObj, hhmm) => {
    const [h, m] = (hhmm || "00:00").split(":").map(Number);
    const d = new Date(dateObj);
    d.setHours(h || 0, m || 0, 0, 0);
    return d;
  };
  const onStartTimeChange = (val) => {
    setStartTime(val);
    const [h, m] = val.split(":").map(Number);
    const tmp = new Date(2000, 0, 1, h || 0, m || 0);
    tmp.setMinutes(tmp.getMinutes() + 60);
    setEndTime(`${pad2(tmp.getHours())}:${pad2(tmp.getMinutes())}`);
  };

  // --- Seçili hafıza göre ders & hata getir ---
  const fetchFiltered = async (hafizId) => {
    if (!hafizId) return;
    try {
      const [hf, da] = await Promise.all([
        api.get("/hatalar/", { params: { hafiz: hafizId } }),
        api.get("/ders-atamalari/", { params: { hafiz: hafizId } }),
      ]);
      setFilteredHatalar(hf.data);
      setDersAtamalari(da.data);
    } catch (err) {
      console.error("Filtreli veriler alınamadı:", err);
    }
  };

  // 1) Eğitmeni belirle (sadece HDMEgitmen ise)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingEgitmen(true);
      try {
        if (!isHDMEgitmen) {
          if (!cancelled) setEgitmen(null);
          return;
        }
        // store'da varsa
        if (teacherInStore?.id) {
          if (!cancelled) {
            setEgitmen({
              id: teacherInStore.id,
              full_name: teacherInStore.full_name || teacherInStore.user?.full_name || "Eğitmen",
            });
          }
          return;
        }
        // userId ile getir
        if (userId) {
          try {
            const tRes = await api.get("/egitmenler/", { params: { user: userId } });
            const t = Array.isArray(tRes.data) ? tRes.data[0] : tRes.data;
            if (t?.id && !cancelled) {
              setEgitmen({
                id: t.id,
                full_name: t.full_name || t.user?.full_name || "Eğitmen",
              });
              return;
            }
          } catch (_) {}
        }
        // fallback: /egitmen/me/
        try {
          const me = await api.get("/egitmen/me/");
          const mt = me.data;
          if (mt?.id && !cancelled) {
            setEgitmen({
              id: mt.id,
              full_name: mt.full_name || mt.user?.full_name || "Eğitmen",
            });
          } else if (!cancelled) setEgitmen(null);
        } catch {
          if (!cancelled) setEgitmen(null);
        }
      } finally {
        if (!cancelled) setLoadingEgitmen(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isHDMEgitmen, userId, teacherInStore]);

  // 2) İlk yükleme: tüm hatalar (hafızları eğitmene göre ayrı effect’te çekeceğiz)
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    (async () => {
      try {
        const hatalarRes = await api.get("/hatalar/");
        setHatalar(hatalarRes.data);
      } catch (err) {
        console.error("Tüm hatalar alınamadı:", err);
      }
    })();
  }, []);

  // 3) EĞİTMEN VARSA: sadece kendi hafızlarını getir
  useEffect(() => {
    if (!isHDMEgitmen || !egitmen?.id) return;
    let cancelled = false;
    (async () => {
      try {
        // Tercih edilen uç: egitmen_detay -> hafizlar
        try {
          const det = await api.get(`/egitmen-detay/${egitmen.id}/`);
          const myHafizlar = det.data?.hafizlar || [];
          if (!cancelled) {
            setHafizlar(myHafizlar);
            // seçili hafız listede değilse ilkine ata
            if (!myHafizlar.some((h) => h.id === selectedHafizId)) {
              const first = myHafizlar[0]?.id ?? null;
              setSelectedHafizId(first);
              if (first) fetchFiltered(first);
            }
          }
          return;
        } catch (_) {
          // yedek: /hafizlar/ indir, hdm_egitmen'e göre filtrele
          const res = await api.get("/hafizlar/");
          const all = res.data || [];
          const mine = all.filter((h) => {
            // bazı serializer'lar hdm_egitmen objesi, bazıları id döndürebilir
            const tid = (h.hdm_egitmen && (h.hdm_egitmen.id || h.hdm_egitmen)) ?? null;
            return Number(tid) === Number(egitmen.id);
          });
          if (!cancelled) {
            setHafizlar(mine);
            if (!mine.some((h) => h.id === selectedHafizId)) {
              const first = mine[0]?.id ?? null;
              setSelectedHafizId(first);
              if (first) fetchFiltered(first);
            }
          }
        }
      } catch (err) {
        console.error("Eğitmenin hafızları alınamadı:", err);
        if (!cancelled) {
          setHafizlar([]);
          setSelectedHafizId(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // api'yi dependency'e koymuyoruz
  }, [isHDMEgitmen, egitmen?.id]);

  // 4) EĞİTMEN DEĞİLSE: tüm hafızları getir (eski davranış)
  useEffect(() => {
    if (isHDMEgitmen) return; // eğitmense bu effect çalışmasın
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get("/hafizlar/");
        if (!cancelled) {
          const list = res.data || [];
          setHafizlar(list);
          if (!list.some((h) => h.id === selectedHafizId)) {
            const first = list[0]?.id ?? null;
            setSelectedHafizId(first);
            if (first) fetchFiltered(first);
          }
        }
      } catch (err) {
        console.error("Hafızlar alınamadı:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isHDMEgitmen]);

  // seçili hafız değişince filtreli verileri tazele
  useEffect(() => {
    if (!selectedHafizId) return;
    fetchFiltered(selectedHafizId);
  }, [selectedHafizId]);

  const handleDersAtama = () => {
    if (!selectedHafizId || !selectedDate) {
      Swal.fire("Eksik bilgi", "Hafız ve tarih seçin.", "warning");
      return;
    }
    if (!isHDMEgitmen || !(egitmen?.id || teacherInStore?.id)) {
      Swal.fire("Yetki yok", "Ders atamak için HDMEgitmen rolü gerekir.", "warning");
      return;
    }
    const start = combineDateAndTime(selectedDate, startTime);
    const end = combineDateAndTime(selectedDate, endTime);
    if (end <= start) {
      Swal.fire("Geçersiz saat", "Bitiş saati başlangıç saatinden büyük olmalı.", "warning");
      return;
    }
    api
      .post("/ders-atamalari/", {
        hafiz: selectedHafizId,
        instructor: egitmen?.id ?? teacherInStore?.id,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        aciklama: "Yeni ders ataması",
        topic: "Ezber",
      })
      .then(() => {
        Swal.fire("Başarılı", "Ders atandı.", "success");
        return fetchFiltered(selectedHafizId);
      })
      .catch((err) => Swal.fire("Hata", "Ders ataması başarısız: " + err, "error"));
  };

  const handleDeleteDers = (dersId) => {
    Swal.fire({
      title: "Emin misiniz?",
      text: "Bu dersi silmek istiyor musunuz?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Evet, sil!",
      cancelButtonText: "Vazgeç",
    }).then((result) => {
      if (!result.isConfirmed) return;
      api
        .delete(`/ders-atamalari/${dersId}/`)
        .then(() => {
          setDersAtamalari((prev) => prev.filter((d) => d.id !== dersId));
          Swal.fire("Silindi", "Ders başarıyla silindi.", "success");
        })
        .catch((err) => Swal.fire("Hata", "Silme işlemi başarısız: " + err, "error"));
    });
  };

  // ✏️ düzenleme modalı
  const openEdit = (d) => {
    setEditItem(d);
    const dt = new Date(d.start_time);
    setEditDate(dt);
    setEditStartTime(formatHHMM(dt));
    const et = d.end_time ? new Date(d.end_time) : new Date(dt.getTime() + 60 * 60000);
    setEditEndTime(formatHHMM(et));
    setEditTopic(d.topic || "");
    setEditAciklama(d.aciklama || "");
    setEditOpen(true);
  };
  const closeEdit = () => {
    setEditOpen(false);
    setEditItem(null);
  };
  const handleUpdateDers = () => {
    if (!editItem) return;
    const start = combineDateAndTime(editDate, editStartTime);
    const end = combineDateAndTime(editDate, editEndTime);
    if (end <= start) {
      Swal.fire("Geçersiz saat", "Bitiş saati başlangıç saatinden büyük olmalı.", "warning");
      return;
    }
    if (!isHDMEgitmen || !(egitmen?.id || teacherInStore?.id)) {
      Swal.fire("Yetki yok", "Ders düzenlemek için HDMEgitmen rolü gerekir.", "warning");
      return;
    }
    const hafizIdForPut = Number(editItem.hafiz_id ?? editItem.hafiz);
    const instructorIdForPut = egitmen?.id ?? teacherInStore?.id;
    api
      .put(`/ders-atamalari/${editItem.id}/`, {
        hafiz: hafizIdForPut,
        instructor: instructorIdForPut,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        topic: editTopic,
        aciklama: editAciklama,
      })
      .then(() => {
        Swal.fire("Güncellendi", "Ders bilgileri güncellendi.", "success");
        closeEdit();
        return fetchFiltered(selectedHafizId);
      })
      .catch((err) => Swal.fire("Hata", "Ders güncelleme başarısız: " + err, "error"));
  };

  const getHafizName = (hafizId) => {
    const hafiz = hafizlar.find((h) => h.id === hafizId);
    return hafiz ? hafiz.full_name : "";
  };

  const filteredDersler = dersAtamalari.filter((d) => {
    const dersDate = new Date(d.start_time);
    return (
      dersDate.toDateString() === selectedDate.toDateString() &&
      (!selectedHafizId || Number(d.hafiz_id ?? d.hafiz) === Number(selectedHafizId))
    );
  });

  const canAssign = isHDMEgitmen && !!(egitmen?.id || teacherInStore?.id);

  return (
    <>
      <HDMBaseHeader />
      <div className="container py-4">
        <Header />
        <div className="row mt-0 mt-md-4">
          <div className="col-md-2 col-12">
            <Sidebar />
          </div>
          <div className="col-md-10 col-12">
            <div className="row g-4">
              <div className="col-md-3">
                <div className="border rounded p-3 shadow-sm bg-white h-100">
                  <h5 className="mb-3 text-primary">🧕 Hafızlar</h5>
                  {hafizlar.length === 0 && isHDMEgitmen && (
                    <div className="text-muted small mb-2">
                      Bu eğitmene atanmış hafız bulunmuyor.
                    </div>
                  )}
                  {hafizlar.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => setSelectedHafizId(h.id)}
                      className={`btn btn-outline-primary w-100 mb-2 text-start ${selectedHafizId === h.id ? "active" : ""}`}
                    >
                      {h.full_name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="col-md-6">
                <div className="card p-3 shadow-sm bg-white h-100">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="text-center mb-3">🗓️ Ders Takvimi</h5>
                    <div className="small text-muted">
                      {loadingEgitmen
                        ? "Eğitmen yükleniyor..."
                        : canAssign
                        ? `👩‍🏫 ${(egitmen?.full_name || teacherInStore?.full_name) ?? "Eğitmen"} (HDMEgitmen)`
                        : isHDMEgitmen
                        ? "👤 Eğitmen bulunamadı"
                        : "👤 Eğitmen değil / tüm hafızlar"}
                    </div>
                  </div>

                  <Calendar className="custom-calendar mb-3" onChange={setSelectedDate} value={selectedDate} />

                  {/* Saat seçimi */}
                  <div className="row g-2">
                    <div className="col-6">
                      <label className="form-label small">Başlangıç Saati</label>
                      <input
                        type="time"
                        className="form-control"
                        step="900"
                        value={startTime}
                        onChange={(e) => onStartTimeChange(e.target.value)}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small">Bitiş Saati</label>
                      <input
                        type="time"
                        className="form-control"
                        step="900"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    className="btn btn-success mt-3 w-100"
                    onClick={handleDersAtama}
                    disabled={!canAssign || !selectedHafizId}
                    title={
                      !selectedHafizId
                        ? "Önce hafız seçin"
                        : canAssign
                        ? "Ders atayabilirsiniz"
                        : "Ders atamak için HDMEgitmen rolü gerekir"
                    }
                  >
                    ➕ Ders Ata
                  </button>

                  <hr />
                  <h6 className="text-center text-muted">🎓 Atanmış Dersler</h6>
                  {filteredDersler.length > 0 ? (
                    <ul className="list-group list-group-flush">
                      {filteredDersler.map((d) => (
                        <li key={d.id} className="list-group-item small d-flex justify-content-between align-items-start">
                          <div>
                            <div className="fw-bold">🎯 {d.topic}</div>
                            <div className="text-muted small mt-1">
                              ⏰{" "}
                              {new Date(d.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}{" "}
                              -{" "}
                              {new Date(d.start_time).toLocaleDateString("tr-TR", {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </div>
                            <div className="text-muted small">
                              🧕 {d.hafiz_detail?.full_name} <br />
                              👩‍🏫 {d.instructor_detail?.full_name}
                            </div>
                            {d.aciklama && <div className="text-muted small mt-1">📝 {d.aciklama}</div>}
                          </div>

                          <div className="d-flex align-items-center gap-2">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => openEdit(d)}
                              disabled={!canAssign}
                              title={canAssign ? "Dersi düzenle" : "Düzenlemek için yetki gerekir"}
                            >
                              Düzenle
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteDers(d.id)}
                            >
                              Sil
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-muted text-center small">
                      Bu gün için ders yok {selectedHafizId ? "" : "(hafız seçilmedi)"}.
                    </div>
                  )}
                </div>
              </div>

              <div className="col-md-3">
                <div className="border rounded p-3 shadow-sm bg-white h-100 overflow-auto">
                  <h5 className="mb-2 text-danger">📋 Tüm Hatalar</h5>
                  <ul className="list-group mb-4">
                    {hatalar.map((h) => (
                      <li key={h.id} className="list-group-item">
                        <strong>Sayfa {h.sayfa}:</strong> {h.aciklama}
                      </li>
                    ))}
                  </ul>
                  <h6 className="mb-2 text-primary">📌 Seçili Hafız: {getHafizName(selectedHafizId) || "-"}</h6>
                  {filteredHatalar.length > 0 ? (
                    <ul className="list-group">
                      {filteredHatalar.map((h) => (
                        <li key={h.id} className="list-group-item">
                          <strong>Sayfa {h.sayfa}:</strong> {h.aciklama}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-muted">Seçili hafıza ait hata kaydı yok.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✏️ Düzenleme Modalı */}
      {editOpen && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: "#00000099" }}>
          <div className="modal-dialog">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header">
                <h5 className="modal-title">Ders Düzenle</h5>
                <button type="button" className="btn-close" onClick={closeEdit}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Tarih</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formatDateInput(editDate)}
                    onChange={(e) => setEditDate(parseDateInput(e.target.value))}
                  />
                </div>
                <div className="row g-2">
                  <div className="col-6">
                    <label className="form-label">Başlangıç Saati</label>
                    <input
                      type="time"
                      className="form-control"
                      step="900"
                      value={editStartTime}
                      onChange={(e) => setEditStartTime(e.target.value)}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label">Bitiş Saati</label>
                    <input
                      type="time"
                      className="form-control"
                      step="900"
                      value={editEndTime}
                      onChange={(e) => setEditEndTime(e.target.value)}
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="form-label">Konu</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editTopic}
                    onChange={(e) => setEditTopic(e.target.value)}
                  />
                </div>
                <div className="mt-3">
                  <label className="form-label">Açıklama</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={editAciklama}
                    onChange={(e) => setEditAciklama(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeEdit}>
                  Vazgeç
                </button>
                <button className="btn btn-primary" onClick={handleUpdateDers} disabled={!canAssign}>
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <HDMBaseFooter />
    </>
  );
};

export default HafizTakip;
