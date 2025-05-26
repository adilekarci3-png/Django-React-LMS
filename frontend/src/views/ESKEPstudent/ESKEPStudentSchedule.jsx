import React, { useState, useEffect, useContext } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import trLocale from "@fullcalendar/core/locales/tr";
import Swal from "sweetalert2";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";
import useAxios from "../../utils/useAxios";
import { ProfileContext } from "../plugin/UserData";

function ESKEPStudentSchedule() {
  const [events, setEvents] = useState([]);
  const [profile] = useContext(ProfileContext);
  const api = useAxios();

  useEffect(() => {
    async function fetchSchedule() {
      if (!profile?.user_id) return;

      try {
        const response = await api.get(`/events/student_schedule/${profile.user_id}/`);
        const data = response.data.map(event => ({
          title: event.title,
          start: event.date,
          backgroundColor: event.background_color,
          borderColor: event.border_color
        }));
        setEvents(data);
      } catch (error) {
        console.error("Takvim verisi alınamadı:", error);
      }
    }

    fetchSchedule();
  }, [profile]);

  const handleEventClick = (clickInfo) => {
    Swal.fire({
      title: clickInfo.event.title,
      text: `Ders Tarihi: ${new Date(clickInfo.event.start).toLocaleDateString("tr-TR")}`,
      icon: "info",
      confirmButtonText: "Tamam",
    });
  };

  const sortedEvents = [...events].sort((a, b) => new Date(a.start) - new Date(b.start));

  return (
    <>
      <ESKEPBaseHeader />
      <section className="pt-5 pb-5 bg-light">
        <div className="container">
          <Header />
          <div className="row mt-0 mt-md-4">
            <Sidebar />
            <div className="col-lg-9 col-md-8 col-12">
              <div className="text-center mb-4">
                <h3 className="fw-bold text-primary">📅 Öğrenci Takvimi</h3>
                <p className="text-muted">Eğitmen ve kendi derslerinizi burada takip edebilirsiniz.</p>
              </div>

              <div className="row">
                {/* Takvim */}
                <div className="col-lg-9 mb-4">
                  <div className="shadow-lg p-4 rounded bg-white" style={{ minHeight: "700px" }}>
                    <FullCalendar
                      plugins={[dayGridPlugin, interactionPlugin]}
                      initialView="dayGridMonth"
                      events={events}
                      locale={trLocale}
                      eventClick={handleEventClick}
                      contentHeight={650}
                      headerToolbar={{
                        left: "prev,next today",
                        center: "title",
                        right: "dayGridMonth,timeGridWeek,timeGridDay",
                      }}
                      eventTextColor="#fff"
                      dayMaxEvents={2}
                    />
                  </div>
                </div>

                {/* Etkinlik Listesi */}
                <div className="col-lg-3">
                  <div className="bg-white shadow-lg p-3 rounded h-100">
                    <h5 className="text-secondary fw-bold mb-3">🗂️ Etkinlik Listesi</h5>
                    <ul className="list-group list-group-flush">
                      {sortedEvents.map((event, index) => (
                        <li
                          key={index}
                          className="list-group-item d-flex justify-content-between align-items-start"
                        >
                          <div>
                            <strong>{event.title}</strong>
                            <div className="text-muted small">
                              {new Date(event.start).toLocaleDateString("tr-TR")}
                            </div>
                          </div>
                          <span className="badge" style={{ backgroundColor: event.backgroundColor }}>
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

export default ESKEPStudentSchedule;
