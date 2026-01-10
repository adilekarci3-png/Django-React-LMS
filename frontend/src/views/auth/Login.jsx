import React, { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";

import { useAuthStore } from "../../store/auth";
import { login } from "../../utils/auth";
import HomeHeader from "../partials/HomeHeader";
import HomeFooter from "../partials/HomeFooter";


function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const user = useAuthStore((state) => state.user?.());
  const rehydrated = useAuthStore((state) => state.rehydrated);

  // ✅ Eğer kullanıcı zaten giriş yapmışsa yönlendir
  useEffect(() => {
    if (rehydrated && user?.user_id) {
      navigate(from, { replace: true });
    }
  }, [rehydrated, user?.user_id]);

  // ⏳ Zustand henüz yüklenmemişse boş ekran veya loader göster
  if (!rehydrated)
    return <div className="text-center mt-5">Oturum yükleniyor...</div>;

  // ✅ Form gönderimi
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await login(email, password); // ✅ doğru kullanım
      if (data && !error) {
        navigate(from, { replace: true }); // başarılı giriş
      } else {
        alert(error || "Giriş yapılamadı.");
      }
    } catch (err) {
      alert("Sunucu hatası: Giriş başarısız.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      
<HomeHeader />
      <section className="vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6 col-md-8 col-sm-10">
              <div className="card shadow-lg border-0 rounded-3">
                <div className="card-body p-5">
                  <h2 className="text-center mb-4 fw-bold">Giriş Yap</h2>

                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">
                        Email Adresi
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        placeholder="ornek@site.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="password" className="form-label">
                        Parola
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        id="password"
                        placeholder="********"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="rememberMe"
                        />
                        <label className="form-check-label" htmlFor="rememberMe">
                          Beni Hatırla
                        </label>
                      </div>
                      <Link to="/forgot-password/" className="text-decoration-none">
                        Şifremi Unuttum
                      </Link>
                    </div>

                    <div className="d-grid">
                      <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            Giriş Yapılıyor{" "}
                            <i className="fas fa-spinner fa-spin ms-2"></i>
                          </>
                        ) : (
                          <>
                            Giriş Yap{" "}
                            <i className="fas fa-sign-in-alt ms-2"></i>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-center mt-3">
                      Hesabınız yok mu?{" "}
                      <Link
                        to="/register/"
                        className="fw-semibold text-decoration-none"
                      >
                        Kayıt Ol
                      </Link>
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <HomeFooter />
    </>
  );
}

export default Login;
