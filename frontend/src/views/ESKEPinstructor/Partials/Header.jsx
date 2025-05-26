import React, { useContext } from "react";
import { ProfileContext } from "../../plugin/Context";

function Header() {
  const [profile] = useContext(ProfileContext);

  if (!profile || !profile.full_name || !profile.image) {
    return null;
  }

  return (
    <div className="row align-items-center">
      <div className="col-xl-12 col-lg-12 col-md-12 col-12">
        <div className="card px-4 pt-4 pb-4 shadow-sm rounded-3 border border-light-subtle">
          <div className="d-flex align-items-end justify-content-between flex-wrap">
            <div className="d-flex align-items-center">
              <div className="me-3 position-relative mt-n5">
                <img
                  src={profile.image}
                  alt="avatar"
                  className="rounded-circle border border-4 border-white shadow"
                  style={{
                    width: "100px",
                    height: "100px",
                    objectFit: "cover",
                  }}
                />
              </div>
              <div className="lh-1">
                <h2 className="mb-1">{profile.full_name}</h2>
                {profile.about && (
                  <p className="mb-0 text-muted">{profile.about}</p>
                )}
              </div>
            </div>
            <div className="text-end mt-3 mt-md-0">
              <a
                href="/profile-edit"
                className="btn btn-primary btn-sm"
              >
                Hesap Ayarları <i className="fas fa-gear fa-spin ms-1"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
