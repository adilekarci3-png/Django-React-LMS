import React, { useState, useEffect, useContext } from "react";
import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";

import useAxios from "../../utils/useAxios";
import UserData from "../plugin/UserData";
import Toast from "../plugin/Toast";  // Toast bileşenini import edin
import { ProfileContext } from "../plugin/Context";

function Profile() {
  const [profile, setProfile] = useContext(ProfileContext);
  const [profileData, setProfileData] = useState({
    image: "",
    full_name: "",
    about: "",
    country: "",
  });
  const [imagePreview, setImagePreview] = useState("");
  const [toastMessage, setToastMessage] = useState(""); // Toast mesajı için durum
  
  
  const fetchProfile = () => {
    useAxios()
      .get(`user/profile/${UserData()?.user_id}/`)
      .then((res) => {
        setProfile(res.data);
        setProfileData(res.data);
        setImagePreview(res.data.image);
      });
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfileChange = (event) => {
    setProfileData({
      ...profileData,
      [event.target.name]: event.target.value,
    });
  };


  
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setProfileData({
      ...profileData,
      [event.target.name]: selectedFile,
    });

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };

    if (selectedFile) {
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const res = await useAxios().get(`user/profile/${UserData()?.user_id}/`);
    const formdata = new FormData();
    if (profileData.image && profileData.image !== res.data.image) {
      formdata.append("image", profileData.image);
    }

    formdata.append("full_name", profileData.full_name);
    formdata.append("about", profileData.about);
    formdata.append("country", profileData.country);

    await useAxios()
      .patch(`user/profile/${UserData()?.user_id}/`, formdata, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        setProfile(res.data);
        Toast().fire({
          icon: "success",
          title: "Profil Güncellendi.",
        });
        //setToastMessage("Profil başarıyla güncellendi!"); // Başarı mesajını ayarla
        setTimeout(() => setToastMessage(""), 3000); // 3 saniye sonra mesajı kaldır
      })
      .catch((err) => {
        Toast().fire({
          icon: "error",
          title: "Bir hata oluştu. Lütfen tekrar deneyin.",
        });
        //setToastMessage("");
        setTimeout(() => setToastMessage(""), 3000); // 3 saniye sonra mesajı kaldır
      });
  };

  return (
    <>
      <BaseHeader />

      {/* Toast mesajını burada göster */}
      {toastMessage && <Toast message={toastMessage} />}

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
                        src={imagePreview}
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
                      <div className="mb-3 col-12 col-md-12">
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
                      </div>
                      <div className="mb-3 col-12 col-md-12">
                        <label className="form-label" htmlFor="lname">
                          Hakkımda
                        </label>
                        <textarea
                          onChange={handleProfileChange}
                          name="about"
                          cols="30"
                          rows="5"
                          className="form-control"
                          value={profileData.about}
                        ></textarea>
                      </div>
                      <div className="mb-3 col-12 col-md-12">
                        <label className="form-label" htmlFor="editCountry">
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

      <BaseFooter />
    </>
  );
}

export default Profile;
