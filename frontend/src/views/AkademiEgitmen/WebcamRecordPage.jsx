import React, { useEffect, useRef, useState } from "react";
import Sidebar from "./Partials/Sidebar";
import AkademiBaseHeader from "../partials/AkademiBaseHeader";
import AkademiBaseFooter from "../partials/AkademiBaseFooter";

const WebcamRecordPage = () => {
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const tickerRef = useRef(null);

  const [devices, setDevices] = useState({ cams: [], mics: [] });
  const [selectedCam, setSelectedCam] = useState("");
  const [selectedMic, setSelectedMic] = useState("");
  const [resolution, setResolution] = useState("1280x720");
  const [recordingState, setRecordingState] = useState("idle"); // idle|recording|paused|stopped
  const [elapsed, setElapsed] = useState(0);
  const [blobUrl, setBlobUrl] = useState(null);
  const [error, setError] = useState("");

  // Yardımcılar
  const parseRes = (res) => {
    const [w, h] = res.split("x").map(Number);
    return { width: { ideal: w }, height: { ideal: h } };
  };

  const stopTracks = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
  };

  const clearRecorder = () => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      try { recorderRef.current.stop(); } catch { }
    }
    recorderRef.current = null;
    chunksRef.current = [];
  };

  const resetTimer = () => {
    if (tickerRef.current) {
      clearInterval(tickerRef.current);
      tickerRef.current = null;
    }
    setElapsed(0);
  };

  const startTimer = () => {
    if (tickerRef.current) clearInterval(tickerRef.current);
    const startedAt = Date.now() - elapsed * 1000;
    tickerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 250);
  };

  const loadDevices = async () => {
    try {
      const all = await navigator.mediaDevices.enumerateDevices();
      const cams = all.filter((d) => d.kind === "videoinput");
      const mics = all.filter((d) => d.kind === "audioinput");
      setDevices({ cams, mics });
      if (!selectedCam && cams[0]) setSelectedCam(cams[0].deviceId);
      if (!selectedMic && mics[0]) setSelectedMic(mics[0].deviceId);
    } catch {
      setError("Cihazlar listelenemedi. Tarayıcı izinlerini kontrol edin.");
    }
  };

  const startPreview = async () => {
    setError("");
    stopTracks();
    const res = parseRes(resolution);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: selectedCam ? { exact: selectedCam } : undefined, ...res },
        audio: { deviceId: selectedMic ? { exact: selectedMic } : undefined, echoCancellation: true, noiseSuppression: true },
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      await loadDevices();
    } catch (e) {
      console.error(e);
      setError("Kamera/Mikrofon erişimi alınamadı. HTTPS ve izinleri doğrulayın.");
    }
  };

  const startRecording = () => {
    setError("");
    if (!mediaStreamRef.current) return setError("Önce önizlemeyi başlatın.");
    chunksRef.current = [];
    const mimeOpts = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm",
    ];
    const mimeType = mimeOpts.find((m) => MediaRecorder.isTypeSupported(m)) || "";
    try {
      const rec = new MediaRecorder(mediaStreamRef.current, mimeType ? { mimeType } : undefined);
      rec.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || "video/webm" });
        const url = URL.createObjectURL(blob);
        setBlobUrl((old) => { if (old) URL.revokeObjectURL(old); return url; });
      };
      rec.start(250);
      recorderRef.current = rec;
      setRecordingState("recording");
      startTimer();
    } catch (e) {
      console.error(e);
      setError("Kayıt başlatılamadı.");
    }
  };

  const pauseRecording = () => {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.pause();
      setRecordingState("paused");
      if (tickerRef.current) clearInterval(tickerRef.current);
    }
  };

  const resumeRecording = () => {
    if (recorderRef.current?.state === "paused") {
      recorderRef.current.resume();
      setRecordingState("recording");
      startTimer();
    }
  };

  const stopRecording = () => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    setRecordingState("stopped");
    if (tickerRef.current) clearInterval(tickerRef.current);
  };

  const downloadVideo = () => {
    if (!blobUrl) return;
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = `kayit_${new Date().toISOString().replace(/[:.]/g, "-")}.webm`;
    a.click();
  };

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Tarayıcınız kamera kaydını desteklemiyor.");
      return;
    }
    startPreview();
    return () => {
      resetTimer();
      clearRecorder();
      stopTracks();
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { loadDevices(); }, []);

  useEffect(() => {
    if (recordingState === "idle" || recordingState === "stopped") {
      startPreview();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCam, selectedMic, resolution]);

  const fmtTime = (s) => {
    const hh = String(Math.floor(s / 3600)).padStart(2, "0");
    const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  };

  return (
    <>
      <AkademiBaseHeader />
      {/* Sayfanın tamamına geniş yatay boşluklar */}
      <section className="py-4 bg-light px-3 px-md-5">
        <div className="container-fluid">
          <div className="row align-items-start gx-tight">
            {/* Sidebar */}
            <div className="col-lg-3 col-md-4 mb-4 pe-1 pe-md-2">
              <Sidebar />
            </div>

            {/* Main (ortalanmış ve daraltılmış) */}
            <div className="col-lg-9 col-md-8 ps-1 ps-md-2">
              <div className="mx-auto" style={{ maxWidth: 960 }}>
                <div className="card shadow-sm border-0">
                  <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                    <h4 className="mb-0">🎥 Webcam ile Video Oluştur</h4>
                    <span className="badge bg-dark-subtle text-white">
                      Süre: <strong className="ms-1">{fmtTime(elapsed)}</strong>
                    </span>
                  </div>

                  <div className="card-body">
                    {/* Kontroller (ortalı) */}
                    <div className="row g-3 mb-3">
                      <div className="col-md-4">
                        <label className="form-label">Kamera</label>
                        <select className="form-select" value={selectedCam} onChange={(e) => setSelectedCam(e.target.value)}>
                          {devices.cams.map((d) => (
                            <option key={d.deviceId} value={d.deviceId}>{d.label || "Kamera"}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Mikrofon</label>
                        <select className="form-select" value={selectedMic} onChange={(e) => setSelectedMic(e.target.value)}>
                          {devices.mics.map((d) => (
                            <option key={d.deviceId} value={d.deviceId}>{d.label || "Mikrofon"}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Çözünürlük</label>
                        <select className="form-select" value={resolution} onChange={(e) => setResolution(e.target.value)}>
                          <option value="1280x720">1280x720 (HD)</option>
                          <option value="1920x1080">1920x1080 (Full HD)</option>
                        </select>
                      </div>
                    </div>

                    {/* Daha küçük video alanı (ortalı, max 720px) */}
                    <div className="mx-auto mb-3" style={{ maxWidth: 720 }}>
                      <div className="ratio ratio-16x9">
                        <video
                          ref={videoRef}
                          className="w-100 rounded bg-dark"
                          playsInline
                          muted
                        />
                      </div>
                    </div>

                    {error && (
                      <div className="alert alert-danger mb-3 text-center">
                        {error} (Not: Kamera/mikrofon için <strong>HTTPS</strong> gerekir.)
                      </div>
                    )}

                    {/* Kayıt Butonları (ortalı) */}
                    <div className="d-flex flex-wrap gap-2 justify-content-center">
                      <button className="btn btn-success" onClick={startRecording} disabled={recordingState === "recording"}>
                        ⏺️ Kaydı Başlat
                      </button>
                      <button className="btn btn-warning" onClick={pauseRecording} disabled={recordingState !== "recording"}>
                        ⏸️ Duraklat
                      </button>
                      <button className="btn btn-info" onClick={resumeRecording} disabled={recordingState !== "paused"}>
                        ▶️ Devam
                      </button>
                      <button className="btn btn-danger" onClick={stopRecording} disabled={recordingState === "idle" || recordingState === "stopped"}>
                        ⏹️ Bitir
                      </button>

                      <div className="d-flex flex-wrap gap-2">
                        <button className="btn btn-outline-secondary" onClick={downloadVideo} disabled={!blobUrl}>
                          ⬇️ İndir (.webm)
                        </button>
                      </div>
                    </div>

                    {/* Kayıt sonrası küçük önizleme (ortalı, max 720px) */}
                    {blobUrl && (
                      <div className="mt-3 mx-auto" style={{ maxWidth: 720 }}>
                        <div className="alert alert-success py-2 text-center">
                          Kayıt hazır. İndirebilirsiniz.
                        </div>
                        <div className="ratio ratio-16x9">
                          <video src={blobUrl} controls className="w-100 rounded" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-muted small mt-3 text-center">
                  İpucu: Kayıt başlamıyorsa, sayfayı <strong>HTTPS</strong> üzerinden açtığınızdan ve tarayıcı izinlerini verdiğinizden emin olun.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <AkademiBaseFooter />
    </>
  );
};

export default WebcamRecordPage;
