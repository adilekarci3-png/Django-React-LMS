import React, { useContext } from "react";
import { ProfileContext } from "../../plugin/Context";

function Header() {
  const [profile] = useContext(ProfileContext);

  if (!profile) return null; // profil gelmemişse hiç gösterme

  return (
    <div className="row align-items-center">
      <div className="col-xl-12 col-lg-12 col-md-12 col-12">
        <div className="card px-4 pt-2 pb-4 shadow-sm rounded-3">
          <div className="d-flex align-items-end justify-content-between">
            <div className="d-flex align-items-center">
              <div className="me-2 position-relative d-flex justify-content-end align-items-end mt-n5">
                <img
                  src={profile.image || "/default-avatar.png"}
                  className="avatar-xl rounded-circle border border-4 border-white"
                  alt="avatar"
                  style={{
                    width: "70px",
                    height: "70px",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              </div>
              <div className="lh-1">
                <h2 className="mb-0">{profile?.full_name || "Bilinmeyen Kullanıcı"}</h2>
                <p className="mb-0 d-block">{profile?.about || "Profil bilgisi yok"}</p>
              </div>
            </div>
            <div>
              <a
                href="/eskep/profile"
                className="btn btn-sm btn-primary"
              >
                Profili Gör
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
