import React, { useState } from "react";
import EskepBaseHeader from "../partials/ESKEPBaseHeader";
import EskepBaseFooter from "../partials/ESKEPBaseFooter";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";

import useAxios from "../../utils/useAxios";
import UserData from "../plugin/UserData";
import Toast from "../plugin/Toast";

function ChangePassword() {
  const [password, setPassword] = useState({
    old_password: "",
    new_password: "",
    confirm_new_password: "",
  });

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
        title: "Şifreler Aynı Değil",
      });
      return; // Prevent further execution
    }

    const formdata = new FormData();
    formdata.append("user_id", UserData()?.user_id);
    formdata.append("old_password", password.old_password);
    formdata.append("new_password", password.new_password); // Fixed typo here

    try {
      const response = await useAxios().post(`user/change-password/`, formdata);
      Toast().fire({
        icon: response.data.icon,
        title: response.data.message,
      });
    } catch (error) {
      Toast().fire({
        icon: "error",
        title: "Bir Sorun Oluştu, Tekrar Deneyiniz.",
      });
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
                  <h3 className="mb-0">Şifre Değiştir</h3>
                </div>
                <div className="card-body">
                  <form
                    className="row gx-3 needs-validation"
                    noValidate=""
                    onSubmit={changePasswordSubmit}
                  >
                    <div className="mb-3 col-12 col-md-12">
                      <label className="form-label" htmlFor="old_password">
                        Eski Şifre
                      </label>
                      <input
                        type="password"
                        id="old_password"
                        className="form-control"
                        placeholder="**************"
                        required
                        name="old_password"
                        value={password.old_password}
                        onChange={handlePasswordChange}
                      />
                    </div>

                    <div className="mb-3 col-12 col-md-12">
                      <label className="form-label" htmlFor="new_password">
                        Yeni Şifre
                      </label>
                      <input
                        type="password"
                        id="new_password"
                        className="form-control"
                        placeholder="**************"
                        required
                        name="new_password"
                        value={password.new_password} // Fixed typo
                        onChange={handlePasswordChange}
                      />
                    </div>

                    <div className="mb-3 col-12 col-md-12">
                      <label className="form-label" htmlFor="confirm_new_password">
                        Yeni Şifre Doğrula
                      </label>
                      <input
                        type="password"
                        id="confirm_new_password"
                        className="form-control"
                        placeholder="**************"
                        required
                        name="confirm_new_password"
                        value={password.confirm_new_password}
                        onChange={handlePasswordChange}
                      />
                    </div>
                    
                    <div className="col-12">
                      <button className="btn btn-primary" type="submit">
                        Yeni Şifreyi Kaydet <i className="fas fa-check-circle"></i>
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
