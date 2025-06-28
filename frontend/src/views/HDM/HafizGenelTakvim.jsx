import React, { useEffect, useState, useMemo } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import { tr } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";

import useAxios from "../../utils/useAxios";
import HDMBaseHeader from "../partials/HDMBaseHeader";
import HDMBaseFooter from "../partials/HDMBaseFooter";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";

const locales = { tr };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
  formats: {
    dateFormat: "dd",
    dayFormat: "dd MMMM yyyy", // Pazartesi 12 Haziran 2025
    weekdayFormat: "EEEE", // Pazartesi
    timeGutterFormat: "HH:mm",
    monthHeaderFormat: "MMMM yyyy", // Haziran 2025
    dayHeaderFormat: "dd MMMM yyyy",
    agendaHeaderFormat: ({ start, end }, culture, local) =>
      `${local.format(start, "dd MMMM", culture)} - ${local.format(end, "dd MMMM", culture)}`,
  },
});

const HafizGenelTakvim = () => {
  const api = useAxios();
  const [dersler, setDersler] = useState([]);
  const [hafizlar, setHafizlar] = useState([]);
  const [selectedHafiz, setSelectedHafiz] = useState("all");
  const [selectedEgitmen, setSelectedEgitmen] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [dersRes, hafizRes] = await Promise.all([
          api.get("ders-atamalari/"),
          api.get("hafizlar/"),
        ]);
        setDersler(dersRes.data);
        setHafizlar(hafizRes.data);
      } catch (err) {
        console.error("Veriler alınamadı:", err);
      }
    };
    fetchAll();
  }, []);

  const getHafizAdSoyad = (id) => {
    const h = hafizlar.find((x) => x.id === id);
    return h?.full_name || "Bilinmeyen Hafız";
  };

  const getEgitmenAdSoyad = (hafizId) => {
    const h = hafizlar.find((x) => x.id === hafizId);
    return h?.hdm_egitmen?.full_name || "Eğitmen Yok";
  };

  const filteredEvents = useMemo(() => {
    if (!hafizlar.length || !dersler.length) return [];

    return dersler
      .filter((d) => {
        const h = hafizlar.find((h) => h.id === d.hafiz);
        const egitmenId = h?.hdm_egitmen?.id;

        return (
          (selectedHafiz === "all" || d.hafiz === parseInt(selectedHafiz)) &&
          (selectedEgitmen === "all" ||
            egitmenId === parseInt(selectedEgitmen)) &&
          (searchQuery === "" ||
            getHafizAdSoyad(d.hafiz)
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            d.topic.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      })
      .map((d) => ({
        id: d.id,
        title: d.topic,
        start: new Date(d.start_time),
        end: new Date(d.end_time),
        allDay: false,
        resource: {
          hafiz: d.hafiz_detail?.full_name,
          egitmen: d.instructor_detail?.full_name,
        },
      }));
  }, [dersler, hafizlar, selectedHafiz, selectedEgitmen, searchQuery]);

  const egitmenMap = useMemo(() => {
    const map = new Map();
    hafizlar.forEach((h) => {
      if (h.hdm_egitmen?.id) {
        map.set(h.hdm_egitmen.id, h.hdm_egitmen.full_name);
      }
    });
    return map;
  }, [hafizlar]);

  return (
    <>
      <HDMBaseHeader />
      <div className="col-lg-10 p-4 mx-auto" style={{ maxWidth: "1400px" }}>
        <div className="row">
          <div className="col-lg-2 bg-light min-vh-100 border-end">
            <Sidebar />
          </div>
          <div className="col-lg-10 p-4">
            <Header />
            <div className="card shadow-sm p-4">
              <h4 className="mb-3">📅 Hafızlık Ders Takvimi</h4>

              <div className="row mb-4">
                <div className="col-md-3 mb-2">
                  <select
                    className="form-select"
                    value={selectedHafiz}
                    onChange={(e) => setSelectedHafiz(e.target.value)}
                  >
                    <option value="all">Tüm Hafızlar</option>
                    {hafizlar.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-3 mb-2">
                  <select
                    className="form-select"
                    value={selectedEgitmen}
                    onChange={(e) => setSelectedEgitmen(e.target.value)}
                  >
                    <option value="all">Tüm Eğitmenler</option>
                    {Array.from(egitmenMap.entries()).map(([id, name]) => (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6 mb-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="🔍 Hafız veya konu arayın..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ height: "75vh", overflow: "auto" }}>
                <Calendar
                  localizer={localizer}
                  culture="tr"
                  events={filteredEvents}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: "100%" }}
                  popup
                  messages={{
                    today: "Bugün",
                    previous: "Geri",
                    next: "İleri",
                    month: "Ay",
                    week: "Hafta",
                    day: "Gün",
                    agenda: "Ajanda",
                    showMore: (total) => `+${total} daha`,
                  }}
                  components={{
                    event: ({ event }) => (
                      <div
                        style={{ whiteSpace: "pre-wrap", fontSize: "0.85rem" }}
                      >
                        🧕 {event.resource?.hafiz}
                        <br />
                        👩‍🏫 {event.resource?.egitmen}
                        <br />
                        🎯 {event.title}
                      </div>
                    ),
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <HDMBaseFooter />
    </>
  );
};

export default HafizGenelTakvim;
