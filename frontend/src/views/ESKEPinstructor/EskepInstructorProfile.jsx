import React, { useState, useEffect, useContext, useRef } from "react";
import EskepBaseHeader from "../partials/ESKEPBaseHeader";
import EskepBaseFooter from "../partials/ESKEPBaseFooter";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import useAxios from "../../utils/useAxios";
import useUserData from "../plugin/useUserData";
import { ProfileContext } from "../plugin/Context";

function Profile() {
  const [profile, setProfile] = useContext(ProfileContext);

  // ❗ Hook'lar en üstte
  const api = useAxios();
  const user = useUserData();

  const [submitting, setSubmitting] = useState(false);
  const [profileData, setProfileData] = useState({
    image: "",        // string (URL) veya File olabilir
    full_name: "",
    about: "",
    country: "",
    education: "",
    expertise: "",
  });

  const [imagePreview, setImagePreview] = useState(""); // blob URL veya string URL
  const prevBlobUrlRef = useRef(null);

  const revokePrevBlobUrl = () => {
    if (prevBlobUrlRef.current) {
      URL.revokeObjectURL(prevBlobUrlRef.current);
      prevBlobUrlRef.current = null;
    }
  };

  const fetchProfile = async () => {
    try {
      const userId = user?.user_id;
      if (!userId) return;
      const { data } = await api.get(`user/profile/${userId}/`);
      setProfile(data);
      setProfileData({
        image: data.image || "",
        full_name: data.full_name || "",
        about: data.about || "",
        country: data.country || "",
        education: data.education || "",
        expertise: data.expertise || "",
      });
      revokePrevBlobUrl();
      setImagePreview(data.image || "");
    } catch (err) {
      console.error("Profil çekilirken hata:", err);
    }
  };

  useEffect(() => {
    fetchProfile();
    return () => revokePrevBlobUrl(); // unmount'ta temizle
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.user_id]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((p) => ({ ...p, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // State'e File olarak yaz
    setProfileData((p) => ({ ...p, image: selectedFile }));

    // Önceki blob URL'yi serbest bırak
    revokePrevBlobUrl();
    const blobUrl = URL.createObjectURL(selectedFile);
    prevBlobUrlRef.current = blobUrl;
    setImagePreview(blobUrl);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);

      const formdata = new FormData();

      // image alanı File ise ekle (URL/string ise ekleme)
      if (profileData.image && profileData.image instanceof File) {
        formdata.append("image", profileData.image);
      }

      formdata.append("full_name", profileData.full_name || "");
      formdata.append("about", profileData.about || "");
      formdata.append("country", profileData.country || "");
      formdata.append("education", profileData.education || "");
      formdata.append("expertise", profileData.expertise || "");

      const userId = user?.user_id;
      const { data } = await api.patch(`user/profile/${userId}/`, formdata /* headers yok */);

      setProfile(data);
      // API’den dönen güncel değerlerle state’i yenile
      setProfileData((p) => ({
        ...p,
        image: data.image || p.image,
        full_name: data.full_name ?? p.full_name,
        about: data.about ?? p.about,
        country: data.country ?? p.country,
        education: data.education ?? p.education,
        expertise: data.expertise ?? p.expertise,
      }));

      // Eğer sunucu yeni bir resim URL'si verdiyse, blob önizlemeyi bırakıp URL'yi göster
      if (data.image) {
        revokePrevBlobUrl();
        setImagePreview(data.image);
      }

    } catch (err) {
      console.error("Profil güncellenirken hata:", err);
      // Burada istersen Toast ya da alert kullanılabilir
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <EskepBaseHeader />
      <section className="pt-5 pb-5">
        <div className="container">
          <Header />
          <div className="row mt-0 mt-md-4">
            <Sidebar />
            <div className="col-lg-9 col-md-8 col-12">
              <div className="card">
                <div className="card-header">
                  <h3 className="mb-0">Profil Detayları</h3>
                  <p className="mb-0">
                    Kendi hesap ayarlarınızı yönetmek için tam kontrole sahipsiniz.
                  </p>
                </div>

                <form className="card-body" onSubmit={handleFormSubmit}>
                  <div className="d-lg-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center mb-4 mb-lg-0">
                      <img
                        src={imagePreview || "/img/placeholder-avatar.png"}
                        id="img-uploaded"
                        className="avatar-xl rounded-circle"
                        alt="avatar"
                        style={{
                          width: "100px",
                          height: "100px",
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                      <div className="ms-3">
                        <h4 className="mb-0">Profil Resminiz</h4>
                        <p className="mb-0">
                          PNG veya JPG, genişliği ve yüksekliği 800 pikselden büyük olmamalıdır.
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
                    <h4 className="mb-0">Profil Detayları</h4>
                    <p className="mb-4">Kişisel bilgilerinizi ve adresinizi düzenleyin.</p>

                    <div className="row gx-3">
                      {/* Full name */}
                      <div className="mb-3 col-12 col-md-12">
                        <label className="form-label" htmlFor="full_name">
                          Adınız Soyadınız
                        </label>
                        <input
                          type="text"
                          id="full_name"
                          className="form-control"
                          placeholder="Adınız"
                          required
                          value={profileData.full_name}
                          onChange={handleProfileChange}
                          name="full_name"
                        />
                        <div className="invalid-feedback">Lütfen Adınızı Giriniz</div>
                      </div>

                      {/* About */}
                      <div className="mb-3 col-12 col-md-12">
                        <label className="form-label" htmlFor="about">
                          Hakkımda
                        </label>
                        <textarea
                          id="about"
                          onChange={handleProfileChange}
                          name="about"
                          rows={5}
                          className="form-control"
                          value={profileData.about}
                        />
                      </div>

                      {/* Country */}
                      <div className="mb-3 col-12 col-md-12">
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
                      </div>

                      {/* Education */}
                      <div className="mb-3 col-12 col-md-12">
                        <label className="form-label" htmlFor="education">
                          Eğitim Bilgisi
                        </label>
                        <input
                          type="text"
                          id="education"
                          className="form-control"
                          placeholder="Eğitim Bilgisi"
                          value={profileData.education}
                          onChange={handleProfileChange}
                          name="education"
                        />
                      </div>

                      {/* Expertise */}
                      <div className="mb-3 col-12 col-md-12">
                        <label className="form-label" htmlFor="expertise">
                          Uzmanlık Alanı
                        </label>
                        <input
                          type="text"
                          id="expertise"
                          className="form-control"
                          placeholder="Uzmanlık Alanı"
                          value={profileData.expertise}
                          onChange={handleProfileChange}
                          name="expertise"
                        />
                      </div>

                      <div className="col-12">
                        <button className="btn btn-primary" type="submit" disabled={submitting}>
                          {submitting ? "Güncelleniyor..." : "Profili Güncelle"}{" "}
                          <i className="fas fa-check-circle"></i>
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
      <EskepBaseFooter />
    </>
  );
}

export default Profile;
