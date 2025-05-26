import React, { useEffect, useRef, useState } from 'react';
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";
import Sidebar from "./Partials/Sidebar";

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
    <>
      <ESKEPBaseHeader />
      <section className="pt-4 pb-5 bg-light">
        <div className="container-fluid">
          <div className="row align-items-start"> {/* DİKKAT: hizalama burada */}
            {/* Sidebar */}
            <div className="col-lg-3 col-md-4 mb-4">
              <Sidebar />
            </div>

            {/* Main Content */}
            <div className="col-lg-9 col-md-8">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-header bg-danger text-white">
                  <h4 className="mb-0">📡 Canlı Yayın</h4>
                </div>
                <div className="card-body">
                  <div className="ratio ratio-16x9">
                    <iframe
                      className="w-100 rounded"
                      src="https://www.youtube.com/embed/LIVE_STREAM_ID?autoplay=1"
                      title="YouTube canlı yayın"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>

                  <p className="text-sm text-muted mt-3 text-center">
                    Bu sayfada geçirilen süre: <strong>{watchDuration} saniye</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <ESKEPBaseFooter />
    </>
  );
};

export default YouTubeLivePage;
