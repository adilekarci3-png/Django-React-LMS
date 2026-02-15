import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAxios from "../utils/useAxios";
import useUserData from "../views/plugin/useUserData";
import AkademiBaseFooter from "../views/partials/AkademiBaseFooter";
import AkademiBaseHeader from "../views/partials/AkademiBaseHeader";


function ShowProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const api = useAxios();
  const user = useUserData();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (user?.user_id) {
          const { data } = await api.get(`user/profile/${user.user_id}/`);
          setProfile(data);
        }
      } catch (err) {
        console.error("Profil yüklenemedi");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user?.user_id]);

  if (loading) return <div className="vh-100 d-flex align-items-center justify-content-center"><div className="spinner-border text-primary" /></div>;

  return (
    <>
      <AkademiBaseHeader />
      <main className="py-5 bg-white min-vh-100">
        <div className="container">
          {/* Geri Dön Navigasyonu */}
          <div className="mb-4 d-flex align-items-center justify-content-between">
            <button onClick={() => navigate(-1)} className="btn btn-link text-decoration-none text-dark p-0">
              <i className="fas fa-chevron-left me-2"></i>Geri Dön
            </button>
            <button onClick={() => navigate("/student/profile")} className="btn btn-primary btn-sm">
              Profili Düzenle
            </button>
          </div>

          <div className="row justify-content-center">
            <div className="col-lg-8">
              {/* Profil Header Kartı */}
              <div className="text-center mb-5">
                <img
                  src={profile?.image || "/img/placeholder-avatar.png"}
                  className="rounded-circle shadow-lg mb-3"
                  style={{ width: 160, height: 160, objectFit: "cover", border: "5px solid #fff" }}
                  alt={profile?.full_name}
                />
                <h1 className="display-6 fw-bold mb-1">{profile?.full_name}</h1>
                <p className="lead text-primary mb-0">{profile?.expertise || "Uzmanlık Alanı Belirtilmemiş"}</p>
                <div className="mt-2 text-muted">
                  <span className="me-3"><i className="fas fa-location-dot me-1"></i>{profile?.country || "Dünya"}</span>
                  <span><i className="fas fa-graduation-cap me-1"></i>{profile?.education || "Eğitim Belirtilmemiş"}</span>
                </div>
              </div>

              {/* Detaylar */}
              <div className="card border-0 bg-light p-4 p-md-5" style={{ borderRadius: 24 }}>
                <h4 className="fw-bold mb-4">Hakkında</h4>
                <p className="text-dark opacity-75 fs-5 lh-base">
                  {profile?.about || "Bu kullanıcı henüz kendisi hakkında bir açıklama eklememiş."}
                </p>
                
                <div className="row mt-5 g-4 text-center">
                  <div className="col-md-4">
                    <div className="p-3">
                      <h6 className="text-uppercase small fw-bold text-muted">Ülke</h6>
                      <p className="mb-0 fw-bold">{profile?.country || "-"}</p>
                    </div>
                  </div>
                  <div className="col-md-4 border-start border-end">
                    <div className="p-3">
                      <h6 className="text-uppercase small fw-bold text-muted">Eğitim</h6>
                      <p className="mb-0 fw-bold">{profile?.education || "-"}</p>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="p-3">
                      <h6 className="text-uppercase small fw-bold text-muted">Uzmanlık</h6>
                      <p className="mb-0 fw-bold">{profile?.expertise || "-"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <AkademiBaseFooter />
    </>
  );
}

export default ShowProfile;