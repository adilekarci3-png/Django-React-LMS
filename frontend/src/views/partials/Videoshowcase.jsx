import { useState, useRef, useEffect } from "react";
import "./css/VideoShowcase.css";

const DEMO_VIDEO =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

export default function VideoShowcase() {
  const videoRef    = useRef(null);
  const progressRef = useRef(null);

  const [playing,   setPlaying]   = useState(false);
  const [progress,  setProgress]  = useState(0);
  const [duration,  setDuration]  = useState(0);
  const [current,   setCurrent]   = useState(0);
  const [hovered,   setHovered]   = useState(false);
  const [scrubbing, setScrubbing] = useState(false);

  /* ── Video event listeners ── */
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onTime  = () => {
      setCurrent(v.currentTime);
      setProgress((v.currentTime / v.duration) * 100 || 0);
    };
    const onMeta  = () => setDuration(v.duration);
    const onEnded = () => setPlaying(false);

    v.addEventListener("timeupdate", onTime);
    v.addEventListener("loadedmetadata", onMeta);
    v.addEventListener("ended", onEnded);

    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("ended", onEnded);
    };
  }, []);

  /* ── Scrubbing ── */
  function seekTo(e) {
    const bar = progressRef.current;
    if (!bar) return;
    const rect  = bar.getBoundingClientRect();
    const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    const v = videoRef.current;
    if (v && v.duration) v.currentTime = ratio * v.duration;
  }

  function onBarMouseDown(e) {
    setScrubbing(true);
    seekTo(e);
  }

  useEffect(() => {
    if (!scrubbing) return;
    const move = (e) => seekTo(e);
    const up   = ()  => setScrubbing(false);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup",   up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup",   up);
    };
  }, [scrubbing]);

  /* ── Play / Pause ── */
  function togglePlay() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play();  setPlaying(true);  }
    else          { v.pause(); setPlaying(false); }
  }

  /* ── Time format helper ── */
  function fmt(s) {
    const m   = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  }

  const controlsVisible = hovered || !playing;

  return (
    <div className="page">

      {/* ── Header ── */}
      <div className="header">
        <div className="badge">
          <span className="badge-dot" />
          Tanıtım Videosu
        </div>

        <h1 className="headline">
          İş kalitenizi{" "}
          <span className="headline-highlight">
            <span className="headline-highlight-bg" />
            <span className="headline-highlight-text">üst seviyeye</span>
          </span>{" "}
          taşıyın
        </h1>

        <p className="subtitle">
          Ürününüzü birkaç saniyede keşfedin. Kurulum gerektirmez.
        </p>
      </div>

      {/* ── Video ── */}
      <div
        className="vid-wrap"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={togglePlay}
      >
        <video ref={videoRef} src={DEMO_VIDEO} preload="metadata" playsInline />

        {/* Center play icon (visible when paused) */}
        <div className="big-center-btn" style={{ opacity: playing ? 0 : 1 }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 4.5L19.5 12L6 19.5V4.5Z"
              fill="white"
              stroke="white"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Bottom controls */}
        <div
          className="controls"
          style={{ opacity: controlsVisible ? 1 : 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Progress bar */}
          <div
            ref={progressRef}
            className="prog-track"
            onMouseDown={onBarMouseDown}
          >
            <div className="prog-fill" style={{ width: `${progress}%` }}>
              <div className="prog-thumb" />
            </div>
          </div>

          {/* Controls row */}
          <div className="ctrl-row">
            {/* Play / Pause */}
            <button className="icon-btn" onClick={togglePlay}>
              {playing ? (
                <svg width="13" height="13" viewBox="0 0 13 13" fill="white">
                  <rect x="1.5" y="1" width="3.5" height="11" rx="1.2" />
                  <rect x="8"   y="1" width="3.5" height="11" rx="1.2" />
                </svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 13 13" fill="white">
                  <path d="M2.5 1.5L11.5 6.5L2.5 11.5V1.5Z" />
                </svg>
              )}
            </button>

            {/* Time */}
            <span className="time-txt">
              {fmt(current)} / {fmt(duration)}
            </span>

            <div className="ctrl-spacer" />

            {/* Fullscreen */}
            <button
              className="icon-btn icon-btn-sm"
              onClick={() => videoRef.current?.requestFullscreen?.()}
            >
              <svg
                width="13" height="13" viewBox="0 0 14 14"
                fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round"
              >
                <path d="M1 5V1H5M9 1H13V5M13 9V13H9M5 13H1V9" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Quote ── */}
      <div className="quote-card">
        <div className="quote-avatar">👤</div>
        <div>
          <div className="quote-text">
            "Her şeyi basitleştirirseniz, her istediğinizi başarabilirsiniz!"
          </div>
          <div className="quote-author">
            — Bill McDermott, SAP'nin önceki Yönetim Kurulu Başkanı
          </div>
        </div>
      </div>

    </div>
  );
}