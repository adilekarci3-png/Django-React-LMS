import React, { useState } from "react";

import AkademiBaseHeader from "../partials/AkademiBaseHeader";
import AkademiBaseFooter from "../partials/AkademiBaseFooter";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";

import { useAuthStore } from "../../store/auth";
import useAxios from "../../utils/useAxios";
import Toast from "../plugin/Toast";

function ChangePassword() {
  const api = useAxios();
  const user_id = useAuthStore((s) => s.allUserData?.user_id);

  const [password, setPassword] = useState({
    old_password: "",
    new_password: "",
    confirm_new_password: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // şifre görünürlüğü
  const [show, setShow] = useState({
    old: false,
    nw: false,
    conf: false,
  });

  // basit güçlü şifre kuralı: en az 8, en az bir sayı ve harf
  const strongEnough =
    password.new_password.length >= 8 &&
    /[A-Za-z]/.test(password.new_password) &&
    /\d/.test(password.new_password);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPassword((prev) => ({ ...prev, [name]: value }));
  };

  const changePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!user_id) {
      Toast().fire({ icon: "error", title: "Oturum bulunamadı." });
      return;
    }

    if (password.confirm_new_password !== password.new_password) {
      Toast().fire({
        icon: "error",
        title: "Yeni şifre ile doğrulama şifresi eşleşmiyor.",
      });
      return;
    }

    if (!strongEnough) {
      Toast().fire({
        icon: "error",
        title: "Yeni şifre en az 8 karakter olmalı ve en az bir harf + bir rakam içermelidir.",
      });
      return;
    }

    try {
      setSubmitting(true);

      const formdata = new FormData();
      formdata.append("user_id", user_id);
      formdata.append("old_password", password.old_password);
      formdata.append("new_password", password.new_password);

      const res = await api.post(`user/change-password/`, formdata);

      Toast().fire({
        icon: res.data?.icon || "success",
        title: res.data?.message || "Şifre başarıyla güncellendi.",
      });

      setPassword({
        old_password: "",
        new_password: "",
        confirm_new_password: "",
      });
    } catch (err) {
      const data = err?.response?.data;
      const firstFieldError =
        (data && typeof data === "object" && Object.values(data).find((v) => typeof v === "string")) ||
        data?.detail ||
        data?.message;

      Toast().fire({
        icon: "error",
        title: firstFieldError || "Şifre güncellenirken bir hata oluştu.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <AkademiBaseHeader />

      <section className="pt-5 pb-5">
        <div className="container">
          <Header />

          <div className="row mt-0 mt-md-4">
            {/* SOL: Sidebar */}
            <div className="col-lg-2 col-md-4 col-12 mb-4 mb-md-0">
              <Sidebar />
            </div>

            {/* SAĞ: İçerik */}
            <div className="col-lg-10 col-md-8 col-12">
              <div className="card">
                <div className="card-header">
                  <h3 className="mb-0">Şifre Değiştir</h3>
                </div>

                <div className="card-body">
                  <form className="row gx-3" onSubmit={changePasswordSubmit} noValidate>
                    {/* Eski Şifre */}
                    <div className="mb-3 col-12">
                      <label className="form-label" htmlFor="password1">Eski Şifre</label>
                      <div className="input-group">
                        <input
                          type={show.old ? "text" : "password"}
                          id="password1"
                          className="form-control"
                          placeholder="**************"
                          required
                          name="old_password"
                          value={password.old_password}
                          onChange={handlePasswordChange}
                          minLength={6}
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => setShow((s) => ({ ...s, old: !s.old }))}
                          tabIndex={-1}
                        >
                          {show.old ? "Gizle" : "Göster"}
                        </button>
                      </div>
                    </div>

                    {/* Yeni Şifre */}
                    <div className="mb-1 col-12">
                      <label className="form-label" htmlFor="password2">Yeni Şifre</label>
                      <div className="input-group">
                        <input
                          type={show.nw ? "text" : "password"}
                          id="password2"
                          className="form-control"
                          placeholder="**************"
                          required
                          name="new_password"
                          value={password.new_password}
                          onChange={handlePasswordChange}
                          minLength={8}
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => setShow((s) => ({ ...s, nw: !s.nw }))}
                          tabIndex={-1}
                        >
                          {show.nw ? "Gizle" : "Göster"}
                        </button>
                      </div>
                    </div>
                    <div className="col-12 mb-3">
                      <small className={`text-${strongEnough ? "success" : "muted"}`}>
                        En az 8 karakter, bir rakam ve bir harf içermelidir.
                      </small>
                    </div>

                    {/* Yeni Şifreyi Doğrula */}
                    <div className="mb-3 col-12">
                      <label className="form-label" htmlFor="password3">Yeni Şifreyi Doğrula</label>
                      <div className="input-group">
                        <input
                          type={show.conf ? "text" : "password"}
                          id="password3"
                          className="form-control"
                          placeholder="**************"
                          required
                          name="confirm_new_password"
                          value={password.confirm_new_password}
                          onChange={handlePasswordChange}
                          minLength={8}
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => setShow((s) => ({ ...s, conf: !s.conf }))}
                          tabIndex={-1}
                        >
                          {show.conf ? "Gizle" : "Göster"}
                        </button>
                      </div>
                      {password.confirm_new_password &&
                        password.confirm_new_password !== password.new_password && (
                          <small className="text-danger">Şifreler eşleşmiyor.</small>
                        )}
                    </div>

                    <div className="col-12">
                      <button className="btn btn-primary" type="submit" disabled={submitting}>
                        {submitting ? "Kaydediliyor..." : "Yeni Şifreyi Kaydet"}{" "}
                        <i className="fas fa-check-circle"></i>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            {/* /SAĞ */}
          </div>
          {/* /ROW */}
        </div>
      </section>

      <AkademiBaseFooter />
    </>
  );
}

export default ChangePassword;
