import React, { useState, useEffect, useContext } from "react";
import EskepBaseHeader from "../partials/ESKEPBaseHeader";
import EskepBaseFooter from "../partials/ESKEPBaseFooter";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import useAxios from "../../utils/useAxios";
import UserData from "../plugin/UserData";
import { ProfileContext } from "../plugin/Context";

function Profile() {
  const [profile, setProfile] = useContext(ProfileContext);
  const [profileData, setProfileData] = useState({
    image: "",
    full_name: "",
    about: "",
    country: "",
    education: "", // Eğitmenler için eklenen yeni alan
    expertise: "", // Eğitmenler için eklenen yeni alan
  });
  const [imagePreview, setImagePreview] = useState("");

  const fetchProfile = () => {
    useAxios()
      .get(`user/profile/${UserData()?.user_id}/`)
      .then((res) => {
        console.log(res.data);
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
    formdata.append("education", profileData.education); // Eğitmenler için eğitim bilgisi ekleniyor
    formdata.append("expertise", profileData.expertise); // Eğitmenler için uzmanlık bilgisi ekleniyor

    await useAxios()
      .patch(`user/profile/${UserData()?.user_id}/`, formdata, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        console.log(res.data);
        setProfile(res.data);
      });
  };

  return (
    <>
      <EskepBaseHeader />
      <section className="pt-5 pb-5">
        <div className="container">
          {/* Header Here */}
          <Header />
          <div className="row mt-0 mt-md-4">
            {/* Sidebar Here */}
            <Sidebar />
            <div className="col-lg-9 col-md-8 col-12">
              {/* Card */}
              <div className="card">
                {/* Card header */}
                <div className="card-header">
                  <h3 className="mb-0">Profil Detayları</h3>
                  <p className="mb-0">
                    Kendi hesap ayarlarınızı yönetmek için tam kontrole sahipsiniz.
                  </p>
                </div>
                {/* Card body */}
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
                          id=""
                        />
                      </div>
                    </div>
                  </div>
                  <hr className="my-5" />
                  <div>
                    <h4 className="mb-0">Profil Detayları</h4>
                    <p className="mb-4">
                      Kişisel bilgilerinizi ve adresinizi düzenleyin.
                    </p>
                    {/* Form */}
                    <div className="row gx-3">
                      {/* Full name */}
                      <div className="mb-3 col-12 col-md-12">
                        <label className="form-label" htmlFor="fname">
                          Adınız Soyadınız
                        </label>
                        <input
                          type="text"
                          id="fname"
                          className="form-control"
                          placeholder="Adınız"
                          required=""
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
                          onChange={handleProfileChange}
                          name="about"
                          cols="30"
                          rows="5"
                          className="form-control"
                          value={profileData.about}
                        ></textarea>
                      </div>

                      {/* Country */}
                      <div className="mb-3 col-12 col-md-12">
                        <label className="form-label" htmlFor="editCountry">
                          Ülke
                        </label>
                        <input
                          type="text"
                          id="country"
                          className="form-control"
                          placeholder="Ülke"
                          required=""
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
                          required=""
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
                          required=""
                          value={profileData.expertise}
                          onChange={handleProfileChange}
                          name="expertise"
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
      <EskepBaseFooter />
    </>
  );
}

export default Profile;
