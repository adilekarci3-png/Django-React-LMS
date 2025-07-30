import React, { useState, useEffect } from "react";
import EskepBaseHeader from "../partials/ESKEPBaseHeader";
import EskepBaseFooter from "../partials/ESKEPBaseFooter";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";

import useAxios from "../../utils/useAxios";
import useUserData from "../plugin/useUserData";
import Toast from "../plugin/Toast";

function ChangePassword() {
  const api = useAxios();
  const user = useUserData(); // ✅ Hook en üstte çağrılır

  const [password, setPassword] = useState({
    old_password: "",
    new_password: "",
    confirm_new_password: "",
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handlePasswordChange = (event) => {
    setPassword({
      ...password,
      [event.target.name]: event.target.value,
    });
  };

  const changePasswordSubmit = async (e) => {
    e.preventDefault();

    if (password.confirm_new_password !== password.new_password) {
      Toast().fire({
        icon: "error",
        title: "Şifreler aynı değil.",
      });
      return;
    }

    const formdata = new FormData();
    formdata.append("user_id", user?.user_id);
    formdata.append("old_password", password.old_password);
    formdata.append("new_password", password.new_password);

    try {
      const response = await api.post("user/change-password/", formdata);
      Toast().fire({
        icon: response.data.icon,
        title: response.data.message,
      });
    } catch (error) {
      Toast().fire({
        icon: "error",
        title: "Bir hata oluştu, lütfen tekrar deneyin.",
      });
    }
  };

  if (!user) return <div className="text-center mt-5">Yükleniyor...</div>;

  return (
    <>
      <EskepBaseHeader />

      <section className="py-5">
        <div className="container">
          <Header />

          <div className="row mt-4">
            {/* SOL SİDEBAR */}
            <div className="col-lg-3 col-md-4 mb-4 mb-md-0">
              <Sidebar />
            </div>

            {/* SAĞ İÇERİK */}
            <div className="col-lg-9 col-md-8">
              <div className="card shadow-sm">
                <div className="card-header">
                  <h3 className="mb-0">Şifre Değiştir</h3>
                </div>
                <div className="card-body">
                  <form className="row g-3" onSubmit={changePasswordSubmit}>
                    <div className="col-12">
                      <label htmlFor="old_password" className="form-label">
                        Eski Şifre
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        id="old_password"
                        name="old_password"
                        placeholder="************"
                        required
                        value={password.old_password}
                        onChange={handlePasswordChange}
                      />
                    </div>

                    <div className="col-12">
                      <label htmlFor="new_password" className="form-label">
                        Yeni Şifre
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        id="new_password"
                        name="new_password"
                        placeholder="************"
                        required
                        value={password.new_password}
                        onChange={handlePasswordChange}
                      />
                    </div>

                    <div className="col-12">
                      <label htmlFor="confirm_new_password" className="form-label">
                        Yeni Şifre (Tekrar)
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        id="confirm_new_password"
                        name="confirm_new_password"
                        placeholder="************"
                        required
                        value={password.confirm_new_password}
                        onChange={handlePasswordChange}
                      />
                    </div>

                    <div className="col-12 text-end">
                      <button type="submit" className="btn btn-primary">
                        Yeni Şifreyi Kaydet <i className="fas fa-check-circle ms-1"></i>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <EskepBaseFooter />
    </>
  );
}

export default ChangePassword;
