import { useEffect, useRef, useState } from "react";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";

function WebcamRecordPage() {
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
    } catch {
      setError("Kamera/Mikrofon erişimi alınamadı. HTTPS ve izinleri doğrulayın.");
    }
  };

  const startRecording = () => {
    setError("");
    if (!mediaStreamRef.current) return setError("Önce önizlemeyi başlatın.");
    chunksRef.current = [];
    const mimeOpts = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"];
    const mimeType = mimeOpts.find((m) => MediaRecorder.isTypeSupported(m)) || "";
    try {
      const rec = new MediaRecorder(mediaStreamRef.current, mimeType ? { mimeType } : undefined);
      rec.ondataavailable = (e) => { if (e.data?.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || "video/webm" });
        const url = URL.createObjectURL(blob);
        setBlobUrl((old) => { if (old) URL.revokeObjectURL(old); return url; });
      };
      rec.start(250);
      recorderRef.current = rec;
      setRecordingState("recording");
      startTimer();
    } catch {
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

  const fmtTime = (s) => {
    const hh = String(Math.floor(s / 3600)).padStart(2, "0");
    const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  };

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Tarayıcınız kamera kaydını desteklemiyor.");
      return;
    }
    loadDevices();
    startPreview();
    return () => {
      resetTimer();
      clearRecorder();
      stopTracks();
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (recordingState === "idle" || recordingState === "stopped") startPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCam, selectedMic, resolution]);

  return (
    <>
      <ESKEPBaseHeader />
      <section className="pt-5 pb-5 bg-light">
        <div className="container-xxl">
          <Header />
          <div className="row mt-0 mt-md-4">
            <div className="col-lg-3 col-md-4 col-12 mb-4">
              <Sidebar />
            </div>
            <div className="col-lg-9 col-md-8 col-12">
              <div className="bg-white p-5 rounded shadow">
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <h3 className="mb-0">
                  <i className="fa-solid fa-film text-warning"></i> Webcam ile Video Oluştur
                </h3>
                
                  <span className="badge bg-secondary fs-6">
                    Süre: {fmtTime(elapsed)}
                  </span>
                  
                </div>
                

                {/* Cihaz Ayarları */}

                <div className="row g-3 mb-4">
                  <p className="text-muted mb-0">
                    Kameranızı kullanarak yeni bir video kaydedin. Kayıt tamamlandıktan sonra videoyu indirip ders materyallerinize ekleyebilirsiniz.
                  </p>
                  <div className="col-md-4">
                    <label className="form-label">Kamera</label>
                    <select
                      className="form-select"
                      value={selectedCam}
                      onChange={(e) => setSelectedCam(e.target.value)}
                    >
                      {devices.cams.map((d) => (
                        <option key={d.deviceId} value={d.deviceId}>
                          {d.label || "Kamera"}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Mikrofon</label>
                    <select
                      className="form-select"
                      value={selectedMic}
                      onChange={(e) => setSelectedMic(e.target.value)}
                    >
                      {devices.mics.map((d) => (
                        <option key={d.deviceId} value={d.deviceId}>
                          {d.label || "Mikrofon"}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Çözünürlük</label>
                    <select
                      className="form-select"
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                    >
                      <option value="1280x720">1280×720 (HD)</option>
                      <option value="1920x1080">1920×1080 (Full HD)</option>
                    </select>
                  </div>
                </div>

                {/* Video Önizleme */}
                <div className="ratio ratio-16x9 mb-3 rounded overflow-hidden bg-dark">
                  <video ref={videoRef} className="w-100" playsInline muted />
                </div>

                {/* Hata */}
                {error && (
                  <div className="alert alert-danger mb-3">
                    {error} — Kamera/mikrofon için <strong>HTTPS</strong> gereklidir.
                  </div>
                )}

                {/* Kayıt Butonları */}
                <div className="d-flex flex-wrap gap-2 justify-content-center mb-3">
                  <button
                    className="btn btn-success"
                    onClick={startRecording}
                    disabled={recordingState === "recording"}
                  >
                    ⏺️ Kaydı Başlat
                  </button>
                  <button
                    className="btn btn-warning"
                    onClick={pauseRecording}
                    disabled={recordingState !== "recording"}
                  >
                    ⏸️ Duraklat
                  </button>
                  <button
                    className="btn btn-info"
                    onClick={resumeRecording}
                    disabled={recordingState !== "paused"}
                  >
                    ▶️ Devam
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={stopRecording}
                    disabled={recordingState === "idle" || recordingState === "stopped"}
                  >
                    ⏹️ Bitir
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={downloadVideo}
                    disabled={!blobUrl}
                  >
                    ⬇️ İndir (.webm)
                  </button>
                </div>

                {/* Kayıt Sonrası Önizleme */}
                {blobUrl && (
                  <div className="mt-3">
                    <div className="alert alert-success py-2 text-center mb-2">
                      Kayıt hazır. İndirebilirsiniz.
                    </div>
                    <div className="ratio ratio-16x9 rounded overflow-hidden">
                      <video src={blobUrl} controls className="w-100" />
                    </div>
                  </div>
                )}

                <p className="text-muted small mt-3 text-center mb-0">
                  İpucu: Kayıt başlamıyorsa sayfayı <strong>HTTPS</strong> üzerinden açtığınızdan
                  ve tarayıcı izinlerini verdiğinizden emin olun.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <ESKEPBaseFooter />
    </>
  );
}

export default WebcamRecordPage;