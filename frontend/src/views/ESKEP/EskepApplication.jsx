// src/pages/EskepApplication.jsx
import React, { useState } from "react";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";
import useAxios from "../../utils/useAxios";
import Swal from "sweetalert2";

export default function EskepApplication() {
  const api = useAxios();
  const [role, setRole] = useState("student"); // student | stajer
  const [loading, setLoading] = useState(false);

  // ortak alanlar
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [notes, setNotes] = useState("");

  // öğrenci özel
  const [school, setSchool] = useState("");
  const [grade, setGrade] = useState("");
  const [program, setProgram] = useState("");

  // stajyer özel
  const [university, setUniversity] = useState("");
  const [department, setDepartment] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [cvFile, setCvFile] = useState(null);

  const validate = () => {
    if (!fullName.trim()) return "Ad Soyad zorunlu.";
    if (!email.trim()) return "E-posta zorunlu.";
    if (!phone.trim()) return "Telefon zorunlu.";
    if (role === "student") {
      if (!school.trim()) return "Okul adı zorunlu.";
    }
    if (role === "stajer") {
      if (!university.trim()) return "Üniversite zorunlu.";
      if (!department.trim()) return "Bölüm zorunlu.";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      Swal.fire("Eksik bilgi", err, "warning");
      return;
    }

    const formData = new FormData();
    formData.append("role", role);
    formData.append("full_name", fullName);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("country", country);
    formData.append("city", city);
    formData.append("notes", notes);

    if (role === "student") {
      formData.append("school", school);
      formData.append("grade", grade);
      formData.append("program", program);
    } else {
      formData.append("university", university);
      formData.append("department", department);
      formData.append("graduation_year", graduationYear);
      if (cvFile) formData.append("cv", cvFile);
    }

    try {
      setLoading(true);
      // backend’de sen bunu böyle yakalarsın:
      // POST /api/eskep/apply/
      await api.post("/eskep/apply/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Swal.fire("Başarılı ✅", "Başvurun alındı, en kısa sürede dönüş yapılacak.", "success");
      // formu temizle
      setFullName("");
      setEmail("");
      setPhone("");
      setCountry("");
      setCity("");
      setNotes("");
      setSchool("");
      setGrade("");
      setProgram("");
      setUniversity("");
      setDepartment("");
      setGraduationYear("");
      setCvFile(null);
    } catch (err) {
      console.error(err);
      Swal.fire("Hata", "Başvuru sırasında bir sorun oluştu.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ESKEPBaseHeader />

      <section className="pt-5 pb-5 bg-light">
        <div className="container" style={{ maxWidth: "1100px" }}>
          <div className="row justify-content-center">
            <div className="col-12 mb-4 text-center">
              <h2 className="fw-bold mb-2">ESKEP Başvuru Formu</h2>
              <p className="text-muted mb-0">
                ESKEP ekosistemine <strong>öğrenci</strong> ya da <strong>stajyer</strong> olarak katılmak için formu doldurun.
              </p>
            </div>

            <div className="col-12">
              <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body p-4 p-md-5">
                  {/* Rol seçimi */}
                  <div className="d-flex gap-3 flex-wrap mb-4">
                    <button
                      type="button"
                      onClick={() => setRole("student")}
                      className={`btn ${
                        role === "student" ? "btn-success" : "btn-outline-success"
                      } rounded-pill px-4 d-flex align-items-center gap-2`}
                    >
                      <i className="fas fa-user-graduate"></i> Öğrenci Başvurusu
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("stajer")}
                      className={`btn ${
                        role === "stajer" ? "btn-primary" : "btn-outline-primary"
                      } rounded-pill px-4 d-flex align-items-center gap-2`}
                    >
                      <i className="fas fa-user-clock"></i> Stajyer Başvurusu
                    </button>
                  </div>

                  <form onSubmit={handleSubmit}>
                    {/* Ortak alanlar */}
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">
                          Ad Soyad <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Adınızı ve soyadınızı yazın"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">
                          E-posta <span className="text-danger">*</span>
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="ornek@mail.com"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">
                          Telefon <span className="text-danger">*</span>
                        </label>
                        <input
                          type="tel"
                          className="form-control"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+90 5xx xxx xx xx"
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label fw-semibold">Ülke</label>
                        <input
                          type="text"
                          className="form-control"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          placeholder="Türkiye"
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label fw-semibold">Şehir</label>
                        <input
                          type="text"
                          className="form-control"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="İstanbul"
                        />
                      </div>
                    </div>

                    {/* ROL: ÖĞRENCİ */}
                    {role === "student" && (
                      <>
                        <hr className="my-4" />
                        <h5 className="mb-3 d-flex align-items-center gap-2">
                          <i className="fas fa-user-graduate text-success"></i> Öğrenci Bilgileri
                        </h5>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="form-label fw-semibold">
                              Okul Adı <span className="text-danger">*</span>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              value={school}
                              onChange={(e) => setSchool(e.target.value)}
                              placeholder="Lise / Ortaokul / Üniversite"
                            />
                          </div>
                          <div className="col-md-3">
                            <label className="form-label fw-semibold">Sınıf / Kademe</label>
                            <input
                              type="text"
                              className="form-control"
                              value={grade}
                              onChange={(e) => setGrade(e.target.value)}
                              placeholder="11. sınıf"
                            />
                          </div>
                          <div className="col-md-3">
                            <label className="form-label fw-semibold">Program</label>
                            <input
                              type="text"
                              className="form-control"
                              value={program}
                              onChange={(e) => setProgram(e.target.value)}
                              placeholder="Sayısal / Sözel / Eşit Ağırlık"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* ROL: STAJYER */}
                    {role === "stajer" && (
                      <>
                        <hr className="my-4" />
                        <h5 className="mb-3 d-flex align-items-center gap-2">
                          <i className="fas fa-user-clock text-primary"></i> Stajyer Bilgileri
                        </h5>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="form-label fw-semibold">
                              Üniversite <span className="text-danger">*</span>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              value={university}
                              onChange={(e) => setUniversity(e.target.value)}
                              placeholder="Üniversite adı"
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label fw-semibold">
                              Bölüm <span className="text-danger">*</span>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              value={department}
                              onChange={(e) => setDepartment(e.target.value)}
                              placeholder="Bilgisayar Müh., İktisat..."
                            />
                          </div>
                          <div className="col-md-4">
                            <label className="form-label fw-semibold">Mezuniyet / Beklenen Yıl</label>
                            <input
                              type="text"
                              className="form-control"
                              value={graduationYear}
                              onChange={(e) => setGraduationYear(e.target.value)}
                              placeholder="2026"
                            />
                          </div>
                          <div className="col-md-8">
                            <label className="form-label fw-semibold">CV / Özgeçmiş (opsiyonel)</label>
                            <input
                              type="file"
                              className="form-control"
                              onChange={(e) => setCvFile(e.target.files[0])}
                              accept=".pdf,.doc,.docx"
                            />
                            <small className="text-muted">PDF veya Word formatında yükleyebilirsiniz.</small>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Notlar */}
                    <hr className="my-4" />
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Açıklama / Not</label>
                      <textarea
                        rows={3}
                        className="form-control"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="İlgi alanlarınız, çalışmak istediğiniz alanlar, eğitmen tercihleri vb."
                      ></textarea>
                    </div>

                    <div className="d-flex justify-content-end">
                      <button
                        type="submit"
                        className="btn btn-primary rounded-pill px-5 d-flex align-items-center gap-2"
                        disabled={loading}
                      >
                        {loading && <span className="spinner-border spinner-border-sm"></span>}
                        Başvuruyu Gönder
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* bilgi kutusu */}
              <div className="alert alert-light border mt-3">
                <strong>Not:</strong> Başvurunuz incelendikten sonra size mail veya telefon yoluyla dönüş
                yapılacaktır. ESKEP koordinatörünüz size sisteme giriş bilgilerini iletecek.
              </div>
            </div>
          </div>
        </div>
      </section>

      <ESKEPBaseFooter />
    </>
  );
}
