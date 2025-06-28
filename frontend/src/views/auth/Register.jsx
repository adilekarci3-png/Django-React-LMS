import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AkademiBaseHeader from "../partials/AkademiBaseHeader";
import AkademiBaseFooter from "../partials/AkademiBaseFooter";
import { register } from "../../utils/auth";
import Toast from "../plugin/Toast";

function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // Hata mesajı için state
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(""); // Önceki hataları temizle

    // Ön uç doğrulama
    if (!fullName.trim()) {
      setErrorMessage("Adınız Soyadınız boş olamaz.");
      setIsLoading(false);
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setErrorMessage("Geçerli bir e-posta adresi girin.");
      setIsLoading(false);
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Şifreniz en az 6 karakter olmalıdır.");
      setIsLoading(false);
      return;
    }
    if (password !== password2) {
      setErrorMessage("Şifreler eşleşmiyor.");
      setIsLoading(false);
      return;
    }

    // Backend isteği
    const { error } = await register(fullName, email, password, password2);
    if (error) {
      setErrorMessage(error);
    } else {
      Toast().fire({
        title: "Kayıt başarılı! Giriş yapabilirsiniz.",
        icon: "success",
      });     
      navigate("/");
    }
    setIsLoading(false);
  };

  return (
    <>
      <AkademiBaseHeader />
      <section className="container d-flex flex-column vh-100" style={{ marginTop: "150px" }}>
        <div className="row align-items-center justify-content-center g-0 h-lg-100 py-8">
          <div className="col-lg-5 col-md-8 py-8 py-xl-0">
            <div className="card shadow">
              <div className="card-body p-6">
                <div className="mb-4">
                  <h1 className="mb-1 fw-bold">Yeni Üyelik</h1>
                  <span>
                    Zaten bir hesabınız var mı?
                    <Link to="/login/" className="ms-1">Giriş Yap</Link>
                  </span>
                </div>

                {/* Hata Mesajı */}
                {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

                {/* Kayıt Formu */}
                <form className="needs-validation" noValidate onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="full_name" className="form-label">Adınız Soyadınız</label>
                    <input
                      type="text"
                      id="full_name"
                      className="form-control"
                      placeholder="Adınız Soyadınız"
                      required
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">E-posta</label>
                    <input
                      type="email"
                      id="email"
                      className="form-control"
                      placeholder="ornek@xyz.com"
                      required
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">Şifre</label>
                    <input
                      type="password"
                      id="password"
                      className="form-control"
                      placeholder="**************"
                      required
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="password2" className="form-label">Şifre Doğrula</label>
                    <input
                      type="password"
                      id="password2"
                      className="form-control"
                      placeholder="**************"
                      required
                      onChange={(e) => setPassword2(e.target.value)}
                    />
                  </div>
                  <div className="d-grid">
                    <button type="submit" className="btn btn-primary" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          Üye Oluşturuluyor <i className="fas fa-spinner fa-spin"></i>
                        </>
                      ) : (
                        <>
                          Üye Ol <i className="fas fa-user-plus"></i>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
      <AkademiBaseFooter />
    </>
  );
}

export default Register;
