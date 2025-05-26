import React, { useEffect, useRef, useState } from 'react';
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";
import Sidebar from "./Partials/Sidebar"; // Buradaki Sidebar aktif hale getirildi

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
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <ESKEPBaseHeader />

      <div className="flex flex-1">
        {/* Sidebar Sol Tarafta */}
        <div className="hidden md:block w-64">
          <Sidebar />
        </div>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="bg-white rounded-lg shadow-md p-5 max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">🎥 Canlı Yayın</h2>

            <div className="aspect-w-16 aspect-h-9 w-full mb-4">
              <iframe
                className="w-full h-full rounded-lg"
                src="https://www.youtube.com/embed/LIVE_STREAM_ID?autoplay=1"
                title="YouTube canlı yayın"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>

            <p className="text-sm text-gray-500 text-center mt-3">
              Bu sayfada geçirilen süre: <strong>{watchDuration} saniye</strong>
            </p>
          </div>
        </main>
      </div>

      <ESKEPBaseFooter />
    </div>
  );
};

export default YouTubeLivePage;
