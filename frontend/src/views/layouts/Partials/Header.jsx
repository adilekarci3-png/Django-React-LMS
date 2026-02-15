import React, { useContext, useMemo, useState } from "react";
import { ProfileContext } from "../../plugin/Context";
import { Link } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import { motion } from "framer-motion";
import "react-loading-skeleton/dist/skeleton.css";

/**
 * Header.jsx (Minimal + Online Dot + Bordo Ayar Butonu)
 */

const THEME = {
  banner: "#f5f5f5",
  ring: "#e5e5e5",
  bordo: "#800020", // bordo renk
};

function chip(label, value) {
  if (value == null) return null;
  return (
    <span className="px-3 py-1 rounded-pill border bg-white text-dark small">
      <span className="fw-semibold me-1">{value}</span>
      <span className="text-muted">{label}</span>
    </span>
  );
}

function Header() {
  const [profile] = useContext(ProfileContext);
  const [imgBroken, setImgBroken] = useState(false);

  const fullName = profile?.full_name || "Kullanıcı";
  const about = profile?.about?.trim() || "Hakkında bilgi girilmemiş";
  const imageSrc = useMemo(() => (!profile?.image || imgBroken ? "/avatar.jpg" : profile.image), [profile?.image, imgBroken]);

  const stats = [
    profile?.course_count != null && { label: "Kurs", value: profile.course_count },
    profile?.student_count != null && { label: "Öğrenci", value: profile.student_count },
    profile?.rating != null && { label: "Puan", value: profile.rating },
  ].filter(Boolean);

  if (!profile) {
    return (
      <motion.div
        className="rounded-4 shadow-sm overflow-hidden mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div style={{ height: 120, background: THEME.banner }} />
        <div className="d-flex px-4 pb-4" style={{ marginTop: -50 }}>
          <Skeleton circle width={100} height={100} />
          <div className="ms-3 mt-4 flex-grow-1">
            <h2><Skeleton width={180} /></h2>
            <p><Skeleton width={280} /></p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="rounded-4 shadow-sm overflow-hidden mb-4 position-relative"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Banner */}
      <div style={{ height: 120, background: THEME.banner }} />

      {/* Content overlay */}
      <div className="position-absolute bottom-0 start-0 end-0 px-3 px-md-4 pb-3">
        <div
          className="d-flex align-items-end justify-content-between rounded-3 px-3 px-md-4 py-2"
          style={{ backdropFilter: "blur(6px)", background: "rgba(255,255,255,0.6)", border: "1px solid #e5e5e5" }}
        >
          <div className="d-flex align-items-center">
            <div className="position-relative me-3" style={{ width: 100, height: 100 }}>
              <div className="rounded-circle p-1" style={{ width: 100, height: 100, background: THEME.ring }}>
                <div className="bg-white rounded-circle w-100 h-100 d-flex align-items-center justify-content-center" style={{ padding: 3 }}>
                  <img
                    src={imageSrc}
                    alt={`${fullName} avatar`}
                    onError={() => setImgBroken(true)}
                    className="rounded-circle"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
              </div>
              {profile?.online && (
                <span
                  className="position-absolute bg-success rounded-circle border border-white"
                  style={{ width: 14, height: 14, right: 6, bottom: 10 }}
                  title="Çevrimiçi"
                />
              )}
            </div>

            <div className="text-dark">
              <h2 className="mb-1 h5">{fullName}</h2>
              <p className="mb-0 small text-muted" style={{ maxWidth: 600 }}>{about}</p>
              {stats.length > 0 && (
                <div className="d-flex flex-wrap gap-2 mt-2">
                  {stats.map((s, i) => <span key={i}>{chip(s.label, s.value)}</span>)}
                </div>
              )}
            </div>
          </div>

          <div className="d-flex align-items-center gap-2 ms-3">
            <Link to="/profile" className="btn btn-outline-secondary btn-sm rounded-pill">
              Profili Gör
            </Link>
          </div>
        </div>
      </div>

      {/* Alt meta */}
      <div className="bg-white px-3 px-md-4 py-2 d-flex flex-wrap align-items-center justify-content-between border-top small text-muted">
        <div className="d-flex gap-3 align-items-center flex-wrap">
          {profile?.email && (<span><i className="far fa-envelope me-1" />{profile.email}</span>)}
          {profile?.city && (<span><i className="fas fa-location-dot me-1" />{profile.city}</span>)}
        </div>
      </div>
    </motion.div>
  );
}

export default Header;