import React, { useState, useEffect, useContext } from "react";
import AkademiBaseHeader from "../partials/AkademiBaseHeader";
import AkademiBaseFooter from "../partials/AkademiBaseFooter";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";

import useAxios from "../../utils/useAxios";
import { useAuthStore } from "../../store/auth";
import { ProfileContext } from "../plugin/Context";

// SweetAlert2
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

function Profile() {
  const api = useAxios();
  const [profile, setProfile] = useContext(ProfileContext);
  const [profileData, setProfileData] = useState({
    image: "",
    full_name: "",
    about: "",
    country: "",
  });
  const [imagePreview, setImagePreview] = useState("");

  const user_id = useAuthStore((s) => s.allUserData?.user_id);

  useEffect(() => {
    if (!user_id) return;

    let cancelled = false;
    api.get(`user/profile/${user_id}/`).then((res) => {
      if (cancelled) return;
      setProfile(res.data);
      setProfileData({
        image: "",
        full_name: res.data.full_name ?? "",
        about: res.data.about ?? "",
        country: res.data.country ?? "",
      });
      setImagePreview(res.data.image || "");
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user_id]); // sadece user_id değişince çek

  const handleProfileChange = (e) =>
    setProfileData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleFileChange = (e) => {
    const f = e.target.files?.[0] || "";
    setProfileData((p) => ({ ...p, image: f }));
    if (f) {
      const url = URL.createObjectURL(f);
      setImagePreview(url);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!user_id) return;

    try {
      const current = await api.get(`user/profile/${user_id}/`);
      const form = new FormData();

      if (profileData.image && profileData.image !== current.data.image) {
        form.append("image", profileData.image);
      }
      form.append("full_name", profileData.full_name || "");
      form.append("about", profileData.about || "");
      form.append("country", profileData.country || "");

      const updated = await api.patch(`user/profile/${user_id}/`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setProfile(updated.data);
      setImagePreview(updated.data.image || imagePreview);

      // ✅ Başarılı bildirim
      Swal.fire({
        title: "Başarılı",
        text: "Profil başarıyla güncellendi.",
        icon: "success",
        confirmButtonText: "Tamam",
      });
    } catch (err) {
      // ❌ Hata bildirimi
      Swal.fire({
        title: "Hata",
        text:
          err?.response?.data?.detail ||
          "Profil güncellenirken bir hata oluştu.",
        icon: "error",
        confirmButtonText: "Tamam",
      });
    }
  };

  return (
    <>
      <AkademiBaseHeader />

      <section className="pt-5 pb-5">
        <div className="container">
          <Header />

          <div className="row mt-0 mt-md-4">
            {/* SOL SÜTUN: Sidebar */}
            <div className="col-lg-2 col-md-4 col-12 mb-4 mb-md-0">
              <Sidebar />
            </div>

            {/* SAĞ SÜTUN: İçerik */}
            <div className="col-lg-10 col-md-8 col-12">
              <div className="card">
                <div className="card-header">
                  <h3 className="mb-0">Profil Detayları</h3>
                  <p className="mb-0">
                    Kendi hesap ayarınızı yönetmek için tam kontrole sahipsiniz.
                  </p>
                </div>

                <form className="card-body" onSubmit={handleFormSubmit}>
                  <div className="d-lg-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center mb-4 mb-lg-0">
                      <img
                        src={imagePreview || "/img/default-avatar.png"}
                        id="img-uploaded"
                        alt="avatar"
                        className="avatar-xl rounded-circle"
                        style={{
                          width: 100,
                          height: 100,
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                      <div className="ms-3">
                        <h4 className="mb-0">Profil Resminiz</h4>
                        <p className="mb-0">
                          PNG veya JPG, 800 pikselden geniş ve uzun olamaz.
                        </p>
                        <input
                          type="file"
                          className="form-control mt-3"
                          name="image"
                          accept="image/png,image/jpeg"
                          onChange={handleFileChange}
                        />
                      </div>
                    </div>
                  </div>

                  <hr className="my-5" />

                  <div>
                    <h4 className="mb-0">Kişisel Detaylar</h4>
                    <p className="mb-4">
                      Kişisel bilgilerinizi ve adresinizi düzenleyin.
                    </p>

                    <div className="row gx-3">
                      <div className="mb-3 col-12">
                        <label className="form-label" htmlFor="fname">
                          Adınız Soyadınız
                        </label>
                        <input
                          type="text"
                          id="fname"
                          className="form-control"
                          placeholder="Adınız"
                          required
                          value={profileData.full_name}
                          onChange={handleProfileChange}
                          name="full_name"
                        />
                        <div className="invalid-feedback">Adınızı Giriniz</div>
                      </div>

                      <div className="mb-3 col-12">
                        <label className="form-label" htmlFor="about">
                          Hakkımda
                        </label>
                        <textarea
                          onChange={handleProfileChange}
                          name="about"
                          id="about"
                          cols="30"
                          rows="5"
                          className="form-control"
                          value={profileData.about}
                        />
                      </div>

                      <div className="mb-3 col-12">
                        <label className="form-label" htmlFor="country">
                          Ülke
                        </label>
                        <input
                          type="text"
                          id="country"
                          className="form-control"
                          placeholder="Ülke"
                          required
                          value={profileData.country}
                          onChange={handleProfileChange}
                          name="country"
                        />
                        <div className="invalid-feedback">
                          Lütfen Ülke Seçiniz
                        </div>
                      </div>

                      <div className="col-12">
                        <button className="btn btn-primary" type="submit">
                          Profili Güncelle <i className="fas fa-check-circle"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </form>

              </div>
            </div>
          </div>
        </div>
      </section>

      <AkademiBaseFooter />
    </>
  );
}

export default Profile;
