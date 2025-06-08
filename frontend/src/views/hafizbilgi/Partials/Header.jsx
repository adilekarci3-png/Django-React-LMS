import React, { useContext } from "react";
import { ProfileContext } from "../../plugin/Context";

function Header() {
  const [profile] = useContext(ProfileContext);

  if (!profile) {
    return (
      <div className="text-muted py-4">
        <div className="spinner-border spinner-border-sm me-2" role="status" />
        Profil yükleniyor...
      </div>
    );
  }

  const imageSrc =
    profile.image && !profile.image.includes("default.jpg")
      ? profile.image
      : "/assets/images/avatar.jpg"; // default avatar yolunu gerektiğinde değiştir

  return (
    <div className="row align-items-center mb-4">
      <div className="col-12">
        <div className="card px-4 pt-3 pb-4 shadow-sm rounded-3">
          <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
            <div className="d-flex align-items-center">
              <div className="me-3">
                <img
                  src={imageSrc}
                  className="rounded-circle border border-4 border-white"
                  alt="Profil"
                  style={{
                    width: "70px",
                    height: "70px",
                    objectFit: "cover",
                  }}
                />
              </div>
              <div>
                <h2 className="mb-1">{profile.full_name}</h2>
                <p className="mb-0 text-muted">
                  {profile.about || "Hakkında bilgi eklenmemiş"}
                </p>
              </div>
            </div>
            <div>
              <a
                href="/profile-edit"
                className="btn btn-sm btn-primary"
              >
                Hesap Ayarları <i className="fas fa-gear fa-spin ms-1" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
