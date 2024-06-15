import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import apiInstance from "../../utils/axios";
import { register } from "../../utils/auth";

import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";

function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await register(fullName, email, password, password2);
    if (error) {
      alert(error);
      setIsLoading(false);
    } else {
      navigate("/");
      alert("Kayıt İşlemi Başarılı Bir Şekilde Gerçekleştirildi. Giriş Yapabilirsiniz");
      setIsLoading(false);
    }
  };

  return (
    <>
      <BaseHeader />

      <section
        className="container d-flex flex-column vh-100"
        style={{ marginTop: "150px" }}
      >
        <div className="row align-items-center justify-content-center g-0 h-lg-100 py-8">
          <div className="col-lg-5 col-md-8 py-8 py-xl-0">
            <div className="card shadow">
              <div className="card-body p-6">
                <div className="mb-4">
                  <h1 className="mb-1 fw-bold">Yeni Üyelik</h1>
                  <span>
                    Zaten Bir Hesabınız Var Mı?
                    <Link to="/login/" className="ms-1">
                      Giriş Yap
                    </Link>
                  </span>
                </div>
                {/* Form */}
                <form
                  className="needs-validation"
                  noValidate=""
                  onSubmit={handleSubmit}
                >
                  {/* Username */}
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Adınız Soyadınız
                    </label>
                    <input
                      type="text"
                      id="full_name"
                      className="form-control"
                      name="full_name"
                      placeholder="Adınız Soyadınız"
                      required=""
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      E-posta
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="form-control"
                      name="email"
                      placeholder="ornek@xyz.com"
                      required=""
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  {/* Password */}
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      Şifre
                    </label>
                    <input
                      type="password"
                      id="password"
                      className="form-control"
                      name="password"
                      placeholder="**************"
                      required=""
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      Şifre Doğrula
                    </label>
                    <input
                      type="password"
                      id="password"
                      className="form-control"
                      name="password"
                      placeholder="**************"
                      required=""
                      onChange={(e) => setPassword2(e.target.value)}
                    />
                  </div>
                  <div>
                    <div className="d-grid">
                      {isLoading === true && (
                        <button
                          disabled
                          type="submit"
                          className="btn btn-primary"
                        >
                          Üye Oluşturuluyor <i className="fas fa-spinner fa-spin"></i>
                        </button>
                      )}

                      {isLoading === false && (
                        <button type="submit" className="btn btn-primary">
                          Üye Ol <i className="fas fa-user-plus"></i>
                        </button>
                      )}
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

export default Register;
