import React, { useContext, useEffect, useState } from "react";
import { ProfileContext } from "../../plugin/Context";
import { Link } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import { motion } from "framer-motion";
import "react-loading-skeleton/dist/skeleton.css";

function Header() {
  const [profile] = useContext(ProfileContext); // setProfile kullanılmıyor, kaldırdım
  const [imageError, setImageError] = useState(false);

  const handleImageError = (e) => {
    setImageError(true);
    e.target.onerror = null;
    e.target.src = "/avatar.jpg";
  };

  const imageSrc = profile?.image || "/avatar.jpg";

  if (!profile) {
    debugger;
    return (
      <div className="row align-items-center">
        <div className="col-12">
          <motion.div
            className="card px-4 pt-2 pb-4 shadow-sm rounded-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="d-flex align-items-end justify-content-between">
              <div className="d-flex align-items-center">
                <div className="me-2 position-relative d-flex justify-content-end align-items-end mt-n5">
                  <Skeleton circle width={70} height={70} />
                </div>
                <div className="lh-1">
                  <h2 className="mb-0"><Skeleton width={150} /></h2>
                  <p className="mb-0"><Skeleton width={200} /></p>
                </div>
              </div>
              <Skeleton width={120} height={30} />
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="row align-items-center">
      <div className="col-12">
        <motion.div
          className="card px-4 pt-2 pb-4 shadow-sm rounded-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="d-flex align-items-end justify-content-between">
            <div className="d-flex align-items-center">
              <div className="me-2 position-relative d-flex justify-content-end align-items-end mt-n5">
                {!imageError ? (
                  <img
                    src={imageSrc}
                    className="avatar-xl rounded-circle border border-4 border-white"
                    alt={profile.full_name || "Kullanıcı avatarı"}
                    style={{
                      width: "70px",
                      height: "70px",
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                    onError={handleImageError}
                  />
                ) : (
                  <div className="avatar-xl rounded-circle border border-4 border-white bg-light d-flex justify-content-center align-items-center">
                    <i className="fas fa-user text-muted" style={{ fontSize: "24px" }}></i>
                  </div>
                )}
              </div>
              <div className="lh-1">
                <h2 className="mb-0">{profile.full_name}</h2>
                <p className="mb-0 text-muted">{profile.about || "Hakkında bilgi girilmemiş"}</p>
              </div>
            </div>
            <div>
              <Link to="/profile-edit" className="btn btn-primary btn-sm">
                Hesap Ayarları <i className="fas fa-gear fa-spin ms-1"></i>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Header;
