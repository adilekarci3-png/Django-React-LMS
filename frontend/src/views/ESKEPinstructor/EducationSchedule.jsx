import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import trLocale from "@fullcalendar/core/locales/tr";
import Swal from "sweetalert2";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";

function EducationSchedule() {
  const [events] = useState([
    { title: "Tefsir Dersi", start: "2025-03-15", backgroundColor: "#28a745", borderColor: "#1e7e34" },
    { title: "Hadis Dersi", start: "2025-03-15", backgroundColor: "#28a745", borderColor: "#1e7e34" },
    { title: "Kıraat Dersi", start: "2025-03-15", backgroundColor: "#28a745", borderColor: "#1e7e34" },
    { title: "Hafızlık Çalışması", start: "2025-03-18", backgroundColor: "#ffc107", borderColor: "#d39e00" },
    { title: "Hadis Konferansı", start: "2025-03-20", backgroundColor: "#dc3545", borderColor: "#bd2130" },
    { title: "Hadis Dersi", start: "2025-03-22", backgroundColor: "#17a2b8", borderColor: "#117a8b" },
    { title: "Tefsir Sınavı", start: "2025-03-25", backgroundColor: "#6610f2", borderColor: "#520dc2" },
  ]);

  const handleEventClick = (clickInfo) => {
    Swal.fire({
      title: clickInfo.event.title,
      text: `Ders Tarihi: ${new Date(clickInfo.event.start).toLocaleDateString("tr-TR")}`,
      icon: "info",
      confirmButtonText: "Tamam",
    });
  };

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
                <h3 className="fw-bold text-primary">📅 Eğitim Takvimi</h3>
                <p className="text-muted">Ders programınızı görüntüleyin ve detaylarına ulaşın.</p>
              </div>

              <div className="shadow-lg p-4 rounded bg-white">
                <FullCalendar
                  plugins={[dayGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  events={events}
                  locale={trLocale}
                  eventClick={handleEventClick}
                  height="auto"
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
          </div>
        </div>
      </section>
      <ESKEPBaseFooter />
    </>
  );
}

export default EducationSchedule;


// import React, { useState, useEffect, useContext } from "react";
// import FullCalendar from "@fullcalendar/react";
// import dayGridPlugin from "@fullcalendar/daygrid";
// import interactionPlugin from "@fullcalendar/interaction";
// import trLocale from "@fullcalendar/core/locales/tr";
// import BaseHeader from "../partials/BaseHeader";
// import BaseFooter from "../partials/BaseFooter";
// import Sidebar from "./Partials/Sidebar";
// import Header from "./Partials/Header";
// import useAxios from "../../utils/useAxios";
// import { ProfileContext } from "../plugin/Context";
// import Swal from "sweetalert2";

// function EducationSchedule() {
//   const [profile] = useContext(ProfileContext);
//   const [events, setEvents] = useState([]);

//   useEffect(() => {
//     async function fetchData() {
//       try {
//         const response = await useAxios().get(`lessons/schedule/${profile?.user_id}/`);
//         const apiEvents = response.data.map((lesson) => ({
//           title: lesson.title,
//           start: lesson.date,
//           backgroundColor: "#007bff",
//           borderColor: "#0056b3",
//         }));

//         // Örnek bazı dersleri ekleyelim
//         const sampleEvents = [
//           { title: "Matematik Dersi", start: "2025-03-15", backgroundColor: "#28a745", borderColor: "#1e7e34" },
//           { title: "Fizik Lab Çalışması", start: "2025-03-18", backgroundColor: "#ffc107", borderColor: "#d39e00" },
//           { title: "Tarih Konferansı", start: "2025-03-20", backgroundColor: "#dc3545", borderColor: "#bd2130" },
//         ];

//         // API'den gelen ve örnek dersleri birleştir
//         setEvents([...apiEvents, ...sampleEvents]);
//       } catch (error) {
//         console.error("Ders programı alınamadı:", error);
//       }
//     }
//     fetchData();
//   }, [profile]);

//   const handleEventClick = (clickInfo) => {
//     Swal.fire({
//       title: clickInfo.event.title,
//       text: `Ders Tarihi: ${new Date(clickInfo.event.start).toLocaleDateString("tr-TR")}`,
//       icon: "info",
//       confirmButtonText: "Tamam",
//     });
//   };

//   return (
//     <>
//       <BaseHeader />
//       <section className="pt-5 pb-5 bg-light">
//         <div className="container">
//           <Header />
//           <div className="row mt-0 mt-md-4">
//             <Sidebar />
//             <div className="col-lg-9 col-md-8 col-12">
//               <div className="text-center mb-4">
//                 <h3 className="fw-bold text-primary">📅 Eğitim Takvimi</h3>
//                 <p className="text-muted">Ders programınızı görüntüleyin ve detaylarına ulaşın.</p>
//               </div>

//               <div className="shadow-lg p-4 rounded bg-white">
//                 <FullCalendar
//                   plugins={[dayGridPlugin, interactionPlugin]}
//                   initialView="dayGridMonth"
//                   events={events}
//                   locale={trLocale}
//                   eventClick={handleEventClick}
//                   height="auto"
//                   headerToolbar={{
//                     left: "prev,next today",
//                     center: "title",
//                     right: "dayGridMonth,timeGridWeek,timeGridDay",
//                   }}
//                   eventDisplay="block"
//                   eventTextColor="#fff"
//                   dayMaxEvents={2}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>
//       <BaseFooter />
//     </>
//   );
// }

// export default EducationSchedule;
