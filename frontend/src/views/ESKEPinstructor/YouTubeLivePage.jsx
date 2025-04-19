import React, { useEffect, useRef, useState } from 'react';
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader"; // Header'ı import et
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter"; // Footer'ı import et
import Sidebar from "./Partials/Sidebar"; // Sidebar'ı import et

const YouTubeLivePage = () => {
  const startTimeRef = useRef(null);
  const [watchDuration, setWatchDuration] = useState(0);

  useEffect(() => {
    startTimeRef.current = Date.now();

    const handleBeforeUnload = () => {
      const endTime = Date.now();
      const duration = Math.floor((endTime - startTimeRef.current) / 1000);
      setWatchDuration(duration);
      console.log("İzleme süresi (sn):", duration);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      handleBeforeUnload();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <ESKEPBaseHeader />
      <div className="flex flex-1">
        {/* Sidebar */}
        {/* <Sidebar /> */}
        <aside className="w-64 bg-green-100 border-r border-gray-300 p-4">
          <h3 className="text-lg font-semibold mb-4">Menü</h3>
          <ul className="space-y-2">
            <li><a href="/dashboard" className="text-green-800 hover:underline">Dashboard</a></li>
            <li><a href="/live" className="text-green-800 hover:underline">Canlı Yayın</a></li>
            <li><a href="/students" className="text-green-800 hover:underline">Öğrenciler</a></li>
            <li><a href="/assignments" className="text-green-800 hover:underline">Ödevler</a></li>
          </ul>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 bg-gray-50">
          <h2 className="text-2xl font-semibold mb-4">Canlı Yayın</h2>
          <div className="aspect-w-16 aspect-h-9 w-full max-w-5xl mx-auto">
            <iframe
              width="100%"
              height="500"
              src="https://www.youtube.com/embed/LIVE_STREAM_ID?autoplay=1"
              title="YouTube canlı yayın"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </main>
      </div>
      <ESKEPBaseFooter />
    </div>
  );
};

export default YouTubeLivePage;
