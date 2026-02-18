import React, { useState, useEffect, useContext, useRef } from "react";
import EskepBaseHeader from "../partials/ESKEPBaseHeader";
import EskepBaseFooter from "../partials/ESKEPBaseFooter";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import useAxios from "../../utils/useAxios";
import useUserData from "../plugin/useUserData";
import { ProfileContext } from "../plugin/Context";
import AvatarCropModal from "../../components/AvatarCropModal";
import { getCroppedFile } from "../../utils/cropImage";

/*
  ✅ Tasarım iyileştirmeleri
  - Daha modern kart yapısı + yumuşak gölgeler
  - Avatar alanında hover ile değiştir butonu (overlay)
  - İki sütunlu düzen (md ve üzeri)
  - Input-group ikonları, tutarlı aralıklar
  - Kaydet / Sıfırla butonları ve disabled state
  - (İsteğe bağlı) max 2MB dosya uyarısı + dosya adı göstergesi
  - Küçük UX detayları: karakter sayacı, yardım metinleri, spinner
*/

function Profile() {
  const [profile, setProfile] = useContext(ProfileContext);

  const [cropOpen, setCropOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);


  // Hook'lar
  const api = useAxios();
  const user = useUserData();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [profileData, setProfileData] = useState({
    image: "", // string (URL) veya File
    full_name: "",
    about: "",
    country: "",
    education: "",
    expertise: "",
  });

  const originalRef = useRef(null); // Sıfırlama için server'dan gelen orijinal veri
  const [imagePreview, setImagePreview] = useState("");
  const prevBlobUrlRef = useRef(null);
  const fileMetaRef = useRef({ name: "", size: 0 });

  const revokePrevBlobUrl = () => {
    if (prevBlobUrlRef.current) {
      URL.revokeObjectURL(prevBlobUrlRef.current);
      prevBlobUrlRef.current = null;
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const userId = user?.user_id;
      if (!userId) return;
      const { data } = await api.get(`user/profile/${userId}/`);
      setProfile(data);
      const normalized = {
        image: data.image || "",
        full_name: data.full_name || "",
        about: data.about || "",
        country: data.country || "",
        education: data.education || "",
        expertise: data.expertise || "",
      };
      originalRef.current = normalized;
      setProfileData(normalized);
      revokePrevBlobUrl();
      setImagePreview(data.image || "");
      fileMetaRef.current = { name: "", size: 0 };
      setError("");
    } catch (err) {
      console.error("Profil çekilirken hata:", err);
      setError("Profil bilgileri alınırken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    return () => revokePrevBlobUrl();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.user_id]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((p) => ({ ...p, [name]: value }));
  };

  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

  const handleFileChange = (e) => {
   const selectedFile = e.target.files?.[0];
   if (!selectedFile) return;

   // aynı dosyayı tekrar seçebilsin diye
   e.target.value = "";

   if (selectedFile.size > MAX_FILE_SIZE) {
    setError("Lütfen 2MB'tan küçük bir görsel yükleyin.");
    return;
   }

   setError("");
   setSuccess("");

   // sadece kırpma için bekletiyoruz
   fileMetaRef.current = { name: selectedFile.name, size: selectedFile.size };
   setPendingFile(selectedFile);
   setCropOpen(true);
  };

  const handleReset = () => {
    if (originalRef.current) {
      setProfileData(originalRef.current);
      revokePrevBlobUrl();
      setImagePreview(originalRef.current.image || "");
      fileMetaRef.current = { name: "", size: 0 };
      setError("");
      setSuccess("");
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const formdata = new FormData();

      if (profileData.image && profileData.image instanceof File) {
        formdata.append("image", profileData.image);
      }

      formdata.append("full_name", profileData.full_name || "");
      formdata.append("about", profileData.about || "");
      formdata.append("country", profileData.country || "");
      formdata.append("education", profileData.education || "");
      formdata.append("expertise", profileData.expertise || "");

      const userId = user?.user_id;
      const { data } = await api.patch(`user/profile/${userId}/`, formdata);

      setProfile(data);
      const updated = {
        image: data.image || profileData.image,
        full_name: data.full_name ?? profileData.full_name,
        about: data.about ?? profileData.about,
        country: data.country ?? profileData.country,
        education: data.education ?? profileData.education,
        expertise: data.expertise ?? profileData.expertise,
      };

      setProfileData(updated);
      originalRef.current = updated; // sıfırlama için güncelle

      if (data.image) {
        revokePrevBlobUrl();
        setImagePreview(data.image);
        fileMetaRef.current = { name: "", size: 0 };
      }

      setSuccess("Profil başarıyla güncellendi.");
    } catch (err) {
      console.error("Profil güncellenirken hata:", err);
      setError("Profil güncellenirken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <EskepBaseHeader />
      <section className="pt-5 pb-5">
        <div className="container-xxl">
          <Header />

          <div className="row mt-0 mt-md-4 g-4">
            <div className="col-lg-3 col-md-4 col-12">
              <Sidebar />
            </div>

            <div className="col-lg-9 col-md-8 col-12">
              {/* Ana Kart */}
              <div className="card border-0 shadow-sm" style={{ borderRadius: 16 }}>
                <div className="card-header bg-white border-0 d-flex align-items-center justify-content-between" style={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
                  <div>
                    <h3 className="mb-1">Profil Detayları</h3>
                    <p className="mb-0 text-muted">Hesap ayarlarınızı buradan yönetebilirsiniz.</p>
                  </div>
                  {loading && (
                    <div className="d-flex align-items-center gap-2 text-muted">
                      <div className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                      <small>Yükleniyor…</small>
                    </div>
                  )}
                </div>

                {/* Uyarılar */}
                {(error || success) && (
                  <div className="px-4 pt-3">
                    {error && (
                      <div className="alert alert-danger mb-3" role="alert">
                        <i className="fas fa-triangle-exclamation me-2" />{error}
                      </div>
                    )}
                    {success && (
                      <div className="alert alert-success mb-3" role="alert">
                        <i className="fas fa-circle-check me-2" />{success}
                      </div>
                    )}
                  </div>
                )}

                <form className="card-body pt-0" onSubmit={handleFormSubmit}>
                  {/* Avatar + Kısa Bilgi */}
                  <div className="row g-4 align-items-center py-4 px-2 px-md-3 border-bottom">
                    <div className="col-12 col-md-5">
                      <div className="position-relative mx-auto" style={{ width: 140, height: 140 }}>
                        <img
                          src={imagePreview || "/img/placeholder-avatar.png"}
                          alt="avatar"
                          className="rounded-circle w-100 h-100"
                          style={{ objectFit: "cover", boxShadow: "0 4px 16px rgba(0,0,0,.08)" }}
                        />

                        {/* Overlay Action */}
                        <label
                          htmlFor="avatarFile"
                          className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center rounded-circle"
                          style={{
                            background: "rgba(0,0,0,.35)",
                            opacity: 0,
                            transition: "opacity .2s",
                            cursor: "pointer",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                          onMouseLeave={(e) => (e.currentTarget.style.opacity = 0)}
                          title="Görsel değiştir"
                        >
                          <span className="badge bg-light text-dark d-flex align-items-center gap-2 py-2 px-3">
                            <i className="fas fa-camera" /> Değiştir
                          </span>
                        </label>
                        <input
                          id="avatarFile"
                          type="file"
                          className="d-none"
                          accept="image/png,image/jpeg"
                          onChange={handleFileChange}
                        />
                      </div>
                      <div className="text-center mt-3">
                        <small className="text-muted d-block">PNG veya JPG. Önerilen maksimum: 800×800px.</small>
                        {fileMetaRef.current.name && (
                          <small className="text-muted d-block mt-1">
                            Seçilen dosya: <strong>{fileMetaRef.current.name}</strong>{" "}
                            (<span>{(fileMetaRef.current.size / 1024).toFixed(0)} KB</span>)
                          </small>
                        )}
                      </div>
                    </div>

                    <div className="col-12 col-md-7">
                      <div className="mb-3">
                        <label className="form-label" htmlFor="full_name">Adınız Soyadınız</label>
                        <div className="input-group">
                          <span className="input-group-text"><i className="fas fa-user" /></span>
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
                        </div>
                        <div className="form-text">Resmi belgelerde göründüğü haliyle adınızı yazın.</div>
                      </div>

                      <div className="mb-0">
                        <label className="form-label" htmlFor="expertise">Uzmanlık Alanı</label>
                        <div className="input-group">
                          <span className="input-group-text"><i className="fas fa-briefcase" /></span>
                          <input
                            type="text"
                            id="expertise"
                            className="form-control"
                            placeholder="Örn. Frontend, Denizcilik, Eğitim"
                            value={profileData.expertise}
                            onChange={handleProfileChange}
                            name="expertise"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detay Formu */}
                  <div className="row g-4 mt-0 px-2 px-md-3 py-4">
                    {/* About */}
                    <div className="col-12">
                      <label className="form-label" htmlFor="about">Hakkımda</label>
                      <textarea
                        id="about"
                        name="about"
                        rows={5}
                        className="form-control"
                        value={profileData.about}
                        onChange={handleProfileChange}
                        maxLength={1000}
                        placeholder="Kendiniz, deneyimleriniz ve ilgi alanlarınız hakkında kısa bir paragraf yazın."
                      />
                      <div className="d-flex justify-content-between align-items-center mt-1">
                        <small className="text-muted">İpucu: Net ve kısa bir özet oluşturun.</small>
                        <small className="text-muted">{profileData.about?.length || 0}/1000</small>
                      </div>
                    </div>

                    {/* Country */}
                    <div className="col-12 col-md-6">
                      <label className="form-label" htmlFor="country">Ülke</label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="fas fa-earth-europe" /></span>
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
                    </div>

                    {/* Education */}
                    <div className="col-12 col-md-6">
                      <label className="form-label" htmlFor="education">Eğitim Bilgisi</label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="fas fa-user-graduate" /></span>
                        <input
                          type="text"
                          id="education"
                          className="form-control"
                          placeholder="Lisans, Yüksek Lisans, Sertifikalar vb."
                          value={profileData.education}
                          onChange={handleProfileChange}
                          name="education"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="d-flex flex-wrap gap-2 justify-content-end px-3 pb-4">
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={handleReset}
                      disabled={submitting || loading}
                    >
                      <i className="fas fa-rotate-left me-2" />Sıfırla
                    </button>

                    <button className="btn btn-primary" type="submit" disabled={submitting || loading}>
                      {submitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                          Güncelleniyor…
                        </>
                      ) : (
                        <>
                          Profili Güncelle <i className="fas fa-check-circle ms-2"></i>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Küçük notlar */}
              <div className="text-muted small mt-3">
                <i className="fas fa-shield-halved me-1" />Yüklediğiniz görseller güvenli bir şekilde işlenir. Yalnızca PNG/JPG desteklenir.
              </div>
            </div>
          </div>
        </div>
      </section>
      <AvatarCropModal
  open={cropOpen}
  file={pendingFile}
  onClose={() => {
    setCropOpen(false);
    setPendingFile(null);
  }}
  onConfirm={async (areaPixels, imageUrl) => {
    try {
      const croppedFile = await getCroppedFile(imageUrl, areaPixels, 512);

      // artık form submit bu dosyayı yollayacak
      setProfileData((p) => ({ ...p, image: croppedFile }));

      // preview'ı kırpılmış dosyaya çevir
      revokePrevBlobUrl();
      const blobUrl = URL.createObjectURL(croppedFile);
      prevBlobUrlRef.current = blobUrl;
      setImagePreview(blobUrl);

      setCropOpen(false);
      setPendingFile(null);
    } catch (err) {
      console.error(err);
      setError("Görsel kırpılırken bir hata oluştu.");
    }
  }}
/>



      <EskepBaseFooter />
    </>
  );
}

export default Profile;
