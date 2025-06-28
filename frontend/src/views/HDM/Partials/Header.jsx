import React, { useContext } from "react";
import { ProfileContext } from "../../plugin/Context";

function Header() {
  const [profile] = useContext(ProfileContext);

  return (
    <div className="row align-items-center">
      <div className="col-12">
        <div className="card px-4 pt-2 pb-4 shadow-sm rounded-3 bg-white">
          <div className="d-flex align-items-center justify-content-between flex-wrap">
            {/* Profil Resmi + İsim */}
            <div className="d-flex align-items-center">
              <div className="me-3 mt-n5">
                <img
                  src={profile?.image || "/default-profile.jpg"}
                  className="avatar-xl border border-4 border-white shadow-sm"
                  alt="avatar"
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "10px", // Kare olsun
                    objectFit: "cover",
                  }}
                />
              </div>
              <div>
                <h3 className="mb-1 fw-bold text-primary">{profile?.full_name}</h3>
                <p className="mb-0 text-muted">{profile?.about || "Hafız Takip Paneli"}</p>
              </div>
            </div>

            {/* Butonlar */}
            <div className="mt-3 mt-md-0">
              <a
                href="/profile-edit"
                className="btn btn-outline-primary btn-sm me-2"
              >
                Hesap Ayarları <i className="fas fa-cog fa-spin ms-1"></i>
              </a>
              <a
                href="/eskep/egitim-takvimi/"
                className="btn btn-primary btn-sm"
              >
                Eğitim Takvimi <i className="fas fa-calendar-alt ms-1"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;