import { useEffect, useState } from "react";
import axios from "axios";
import { TextField, Button } from "@mui/material";
import Swal from "sweetalert2";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";

function InstructorProfile() {
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone: "",
    bio: ""
  });

  const fetchProfile = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/v1/instructor/profile/");
      setProfile(response.data);
    } catch (error) {
      console.error("Profil getirme hatası:", error);
    }
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.put("http://127.0.0.1:8000/api/v1/instructor/profile/update/", profile);
      Swal.fire("Güncellendi", "Profil başarıyla güncellendi.", "success");
    } catch (error) {
      Swal.fire("Hata", "Profil güncellenemedi.", "error");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
      <>
          <ESKEPBaseHeader />
    <section className="pt-5 pb-5">
      <div className="container">
        <div className="card shadow-sm col-md-8 mx-auto">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">Eğitmen Profil Bilgileri</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <TextField
                  label="Ad Soyad"
                  name="full_name"
                  value={profile.full_name}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                />
              </div>

              <div className="mb-3">
                <TextField
                  label="E-posta"
                  name="email"
                  value={profile.email}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                />
              </div>

              <div className="mb-3">
                <TextField
                  label="Telefon"
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                />
              </div>

              <div className="mb-3">
                <TextField
                  label="Hakkında (Bio)"
                  name="bio"
                  value={profile.bio}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={4}
                />
              </div>

              <div className="d-grid">
                <Button type="submit" variant="contained" color="primary">
                  Profili Güncelle
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
     <ESKEPBaseFooter />
        </>
  );
}

export default InstructorProfile;
