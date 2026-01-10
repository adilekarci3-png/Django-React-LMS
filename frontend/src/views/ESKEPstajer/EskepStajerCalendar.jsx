// src/pages/ESKEP/Stajer/StajerCalendar.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import trLocale from "@fullcalendar/core/locales/tr";

import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";
import Header from "./Partials/Header";
import Sidebar from "./Partials/Sidebar";

import useAxios from "../../utils/useAxios";
import useUserData from "../plugin/useUserData";

const TYPE_COLORS = {
  proje: { bg: "#0d6efd", border: "#0d6efd" },
  kitap: { bg: "#6610f2", border: "#6610f2" },
  ders: { bg: "#198754", border: "#198754" },
  odev: { bg: "#dc3545", border: "#dc3545" },
  default: { bg: "#6c757d", border: "#6c757d" },
};

export default function EskepStajerCalendar() {
  const api = useAxios();
  const user = useUserData();
  const navigate = useNavigate();

  const [rawEvents, setRawEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // filtreler
  const [showProje, setShowProje] = useState(true);
  const [showKitap, setShowKitap] = useState(true);
  const [showDers, setShowDers] = useState(true);
  const [showOdev, setShowOdev] = useState(true);

  useEffect(() => {
    if (!user?.user_id) return;

    async function fetchAll() {
      setLoading(true);
      try {
        // 1) Projeler
        const projeRes = await api.get(
          `eskepstajer/proje-list/${user.user_id}/`
        );

        // 2) Kitap tahlilleri
        let kitapRes = { data: [] };
        try {
          kitapRes = await api.get(
            `eskepstajer/kitaptahlili-list/${user.user_id}/`
          );
        } catch (e) {}

        // 3) Ders sonu raporları
        let dersRes = { data: [] };
        try {
          dersRes = await api.get(
            `eskepstajer/derssonuraporu-list/${user.user_id}/`
          );
        } catch (e) {}

        // 4) Ödevler
        let odevRes = { data: [] };
        try {
          odevRes = await api.get(`eskepstajer/odev-list/${user.user_id}/`);
        } catch (e) {}

        // PROJE eventleri
        const projeEvents = (projeRes.data || []).flatMap((p) => {
          const list = [];

          // 1) proje oluşturma tarihi
          if (p.date) {
            list.push({
              id: `proje-${p.id}`,
              title: `Proje: ${p.title}`,
              start: p.date,
              backgroundColor: TYPE_COLORS.proje.bg,
              borderColor: TYPE_COLORS.proje.border,
              extendedProps: {
                type: "proje",
                raw: p,
              },
            });
          }

          // 2) haftalık teslimler
          if (Array.isArray(p.weeks)) {
            p.weeks.forEach((w) => {
              // backend haftaya tarih vermezse: proje tarihinden +7 gün çarpımı
              const base = p.date ? new Date(p.date) : new Date();
              const weekDate = new Date(
                base.getFullYear(),
                base.getMonth(),
                base.getDate() + (w.week_no - 1) * 7
              );
              list.push({
                id: `projeweek-${p.id}-${w.week_no}`,
                title: `Proje Haftası ${w.week_no} – ${p.title}`,
                start: weekDate.toISOString().slice(0, 10),
                backgroundColor: TYPE_COLORS.proje.bg,
                borderColor: TYPE_COLORS.proje.border,
                extendedProps: {
                  type: "proje",
                  raw: p,
                  week_no: w.week_no,
                },
              });
            });
          }

          return list;
        });

        // KİTAP eventleri
        const kitapEvents = (kitapRes.data || []).map((k) => {
          const d = k?.date || k?.created_at || k?.deadline;
          const dateStr = d
            ? new Date(d).toISOString().slice(0, 10)
            : new Date().toISOString().slice(0, 10);

          return {
            id: `kitap-${k.id}`,
            title: `Kitap Tahlili: ${k.title || k.kitap_adi || "Tahlil"}`,
            start: dateStr,
            backgroundColor: TYPE_COLORS.kitap.bg,
            borderColor: TYPE_COLORS.kitap.border,
            extendedProps: {
              type: "kitap",
              raw: k,
            },
          };
        });

        // DERS SONU RAPORU eventleri
        const dersEvents = (dersRes.data || []).map((d) => {
          const dd = d?.date || d?.created_at || d?.rapor_tarihi;
          const dateStr = dd
            ? new Date(dd).toISOString().slice(0, 10)
            : new Date().toISOString().slice(0, 10);

          return {
            id: `ders-${d.id}`,
            title: `Ders Sonu Raporu: ${d.title || d.konu || "Rapor"}`,
            start: dateStr,
            backgroundColor: TYPE_COLORS.ders.bg,
            borderColor: TYPE_COLORS.ders.border,
            extendedProps: {
              type: "ders",
              raw: d,
            },
          };
        });

        // ÖDEV eventleri
        const odevEvents = (odevRes.data || []).map((o) => {
          const dd = o?.deadline || o?.bitis_tarihi || o?.date;
          const dateStr = dd
            ? new Date(dd).toISOString().slice(0, 10)
            : new Date().toISOString().slice(0, 10);

          return {
            id: `odev-${o.id}`,
            title: `Ödev: ${o.title || o.odev_adi || "Ödev"}`,
            start: dateStr,
            backgroundColor: TYPE_COLORS.odev.bg,
            borderColor: TYPE_COLORS.odev.border,
            extendedProps: {
              type: "odev",
              raw: o,
            },
          };
        });

        setRawEvents([
          ...projeEvents,
          ...kitapEvents,
          ...dersEvents,
          ...odevEvents,
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, [api, user?.user_id]);

  // filtre uygulanmış eventler
  const filteredEvents = useMemo(() => {
    return rawEvents.filter((e) => {
      const t = e.extendedProps?.type;
      if (t === "proje" && !showProje) return false;
      if (t === "kitap" && !showKitap) return false;
      if (t === "ders" && !showDers) return false;
      if (t === "odev" && !showOdev) return false;
      return true;
    });
  }, [rawEvents, showProje, showKitap, showDers, showOdev]);

  const handleEventClick = (info) => {
    const type = info.event.extendedProps?.type;
    const raw = info.event.extendedProps?.raw;

    if (type === "proje") {
      navigate(`/eskep/edit-proje/${raw.id}`);
    } else if (type === "kitap") {
      navigate(`/eskep/kitap-tahlili/${raw.id}`);
    } else if (type === "ders") {
      navigate(`/eskep/ders-rapor/${raw.id}`);
    } else if (type === "odev") {
      navigate(`/eskep/odev/${raw.id}`);
    }
  };

  // sağdaki liste için tarihe göre sırala
  const sortedEvents = [...filteredEvents].sort(
    (a, b) => new Date(a.start) - new Date(b.start)
  );

  return (
    <>
      <ESKEPBaseHeader />
      <section className="pt-5 pb-5 bg-light">
        <div className="container-xxl">
          <Header />
          <div className="row mt-0 mt-md-4 align-items-start">
            {/* Sidebar */}
            <div className="col-lg-3 col-md-4 col-12 mb-4">
              <Sidebar />
            </div>

            {/* Ana içerik */}
            <div className="col-lg-9 col-md-8 col-12">
              <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <div>
                  <h3 className="fw-bold mb-1">📅 Stajer Takvimi</h3>
                  <p className="text-muted mb-0">
                    Projeler, kitap tahlilleri, ders sonu raporları ve ödevlerin teslim
                    tarihleri burada.
                  </p>
                </div>
                <div className="text-muted small">
                  {loading ? "Yükleniyor..." : `${filteredEvents.length} etkinlik`}
                </div>
              </div>

              <div className="row">
                {/* Takvim */}
                <div className="col-lg-9 mb-4">
                  <div
                    className="shadow-sm p-3 rounded bg-white"
                    style={{ minHeight: "700px" }}
                  >
                    {/* Filtre barını takvimin üstüne alalım */}
                    <div className="d-flex flex-wrap gap-3 mb-3">
                      <label className="form-check d-flex align-items-center gap-2">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={showProje}
                          onChange={(e) => setShowProje(e.target.checked)}
                        />
                        <span
                          style={{
                            width: 10,
                            height: 10,
                            backgroundColor: TYPE_COLORS.proje.bg,
                            display: "inline-block",
                            borderRadius: 2,
                          }}
                        ></span>
                        Projeler
                      </label>
                      <label className="form-check d-flex align-items-center gap-2">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={showKitap}
                          onChange={(e) => setShowKitap(e.target.checked)}
                        />
                        <span
                          style={{
                            width: 10,
                            height: 10,
                            backgroundColor: TYPE_COLORS.kitap.bg,
                            display: "inline-block",
                            borderRadius: 2,
                          }}
                        ></span>
                        Kitap Tahlilleri
                      </label>
                      <label className="form-check d-flex align-items-center gap-2">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={showDers}
                          onChange={(e) => setShowDers(e.target.checked)}
                        />
                        <span
                          style={{
                            width: 10,
                            height: 10,
                            backgroundColor: TYPE_COLORS.ders.bg,
                            display: "inline-block",
                            borderRadius: 2,
                          }}
                        ></span>
                        Ders Sonu Raporları
                      </label>
                      <label className="form-check d-flex align-items-center gap-2">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={showOdev}
                          onChange={(e) => setShowOdev(e.target.checked)}
                        />
                        <span
                          style={{
                            width: 10,
                            height: 10,
                            backgroundColor: TYPE_COLORS.odev.bg,
                            display: "inline-block",
                            borderRadius: 2,
                          }}
                        ></span>
                        Ödevler
                      </label>
                    </div>

                    <FullCalendar
                      plugins={[dayGridPlugin, interactionPlugin]}
                      initialView="dayGridMonth"
                      events={filteredEvents}
                      locale={trLocale}
                      eventClick={handleEventClick}
                      contentHeight={600}
                      headerToolbar={{
                        left: "prev,next today",
                        center: "title",
                        right: "dayGridMonth,dayGridWeek,dayGridDay",
                      }}
                      dayMaxEvents={3}
                      eventTextColor="#fff"
                    />
                  </div>
                </div>

                {/* Etkinlik Listesi */}
                <div className="col-lg-3">
                  <div className="bg-white shadow-sm p-3 rounded h-100">
                    <h5 className="text-secondary fw-bold mb-3">
                      📋 Etkinlikler
                    </h5>
                    <ul className="list-group list-group-flush">
                      {sortedEvents.length === 0 && (
                        <li className="list-group-item text-muted small">
                          Etkinlik bulunamadı.
                        </li>
                      )}

                      {sortedEvents.map((event) => (
                        <li
                          key={event.id}
                          className="list-group-item d-flex justify-content-between align-items-start"
                          style={{ cursor: "pointer" }}
                          onClick={() =>
                            handleEventClick({ event: { ...event } })
                          }
                        >
                          <div>
                            <strong>{event.title}</strong>
                            <div className="text-muted small">
                              {new Date(event.start).toLocaleDateString("tr-TR")}
                            </div>
                          </div>
                          <span
                            className="badge"
                            style={{ backgroundColor: event.backgroundColor }}
                          >
                            &nbsp;
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <ESKEPBaseFooter />
    </>
  );
}
