import React, { useState, useEffect } from "react";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import useAxios from "../../utils/useAxios";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";
import { useFormik } from "formik";
import * as Yup from "yup";
import InputMask from "react-input-mask";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function AssignCoordinator() {
  const [coordinators, setCoordinators] = useState([]);
  const [filteredCoordinators, setFilteredCoordinators] = useState([]);
  const [students, setStudents] = useState([]);
  const [interns, setInterns] = useState([]);

  const [selectedCoordinator, setSelectedCoordinator] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedUserToAssign, setSelectedUserToAssign] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const api = useAxios();

  const exportToExcel = (data, fileName) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sayfa1");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `${fileName}.xlsx`);
  };

  const formik = useFormik({
    initialValues: {
      role: "",
      full_name: "",
      evtel: "",
      istel: "",
      ceptel: "",
      email: "",
      gender: "",
      instructor: "",
    },
    validationSchema: Yup.object({
      role: Yup.string().required("Kullanıcı tipi zorunludur."),
      full_name: Yup.string().required("Ad soyad zorunludur."),
      email: Yup.string().email("Geçerli bir e-posta giriniz"),
      ceptel: Yup.string().required("Cep telefonu zorunludur."),
      gender: Yup.string().required("Cinsiyet zorunludur."),
      instructor: Yup.string().required("Koordinatör seçimi zorunludur."),
    }),
    onSubmit: async (values, { resetForm, setFieldError, setSubmitting }) => {
      const endpoint = values.role === "Ogrenci" ? "ogrenci/" : "stajer/";

      try {
        const response = await api.post(endpoint, values);

        setMessage(
          `${values.role === "Ogrenci" ? "Öğrenci" : "Stajyer"} başarıyla oluşturuldu.`
        );
        setMessageType("success");

        if (values.role === "Ogrenci") {
          setStudents((prev) => [...prev, response.data]);
        } else {
          setInterns((prev) => [...prev, response.data]);
        }

        resetForm();
      } catch (error) {
        if (error.response?.data) {
          const errors = error.response.data;
          for (const key in errors) {
            setFieldError(key, errors[key][0]);
          }
          const msg = Object.values(errors).flat().join(" ");
          setMessage(msg);
        } else {
          setMessage("Kullanıcı oluşturulurken hata oluştu.");
        }
        setMessageType("error");
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [coordinatorsRes, studentsRes, internsRes] = await Promise.all([
          api.get("eskep/coordinators"),
          api.get("eskep/ogrencis"),
          api.get("eskep/stajers"),
        ]);

        setCoordinators(coordinatorsRes.data);
        setStudents(studentsRes.data);
        setInterns(internsRes.data);
      } catch (error) {
        console.error("Veriler alınırken hata oluştu", error);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    if (formik.values.role) {
      const filtered = coordinators.filter((c) =>
        formik.values.role === "Ogrenci"
          ? c.role === "Ogrenci"
          : c.role === "Stajer"
      );
      setFilteredCoordinators(filtered);
    } else {
      setFilteredCoordinators([]);
    }
  }, [formik.values.role, coordinators]);

  const handleRoleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedCoordinator || !selectedRole) {
      setMessage("Lütfen koordinatör ve rol seçiniz.");
      setMessageType("error");
      return;
    }

    try {
      await api.post("/eskep/update_coordinator_role", {
        coordinator_id: selectedCoordinator,
        role: selectedRole,
      });

      setMessage("Koordinatör rolü başarıyla güncellendi.");
      setMessageType("success");

      // ✅ Sayfayı tamamen yenile
      setTimeout(() => {
        window.location.reload();
      }, 1000); // 1 saniye sonra yenile (mesaj görünür kalır)
    } catch (error) {
      console.error(error);
      setMessage("Rol güncelleme sırasında hata oluştu.");
      setMessageType("error");
    }
  };

  const handleUserAssign = async (e) => {
    e.preventDefault();
    if (!selectedCoordinator || !selectedUserToAssign || !selectedRole) {
      setMessage("Tüm alanlar doldurulmalıdır.");
      setMessageType("error");
      return;
    }

    try {
      const endpoint =
        selectedRole === "Ogrenci"
          ? "eskep/assign-student"
          : "eskep/assign-intern";
      const payload =
        selectedRole === "Ogrenci"
          ? {
              coordinator_id: selectedCoordinator,
              student_id: selectedUserToAssign,
            }
          : {
              coordinator_id: selectedCoordinator,
              intern_id: selectedUserToAssign,
            };

      await api.post(endpoint, payload);
      setMessage("Eşleştirme başarıyla yapıldı.");
      setMessageType("success");
    } catch (err) {
      console.error(err);
      setMessage("Eşleştirme sırasında hata oluştu.");
      setMessageType("error");
    }
  };

  return (
    <>
      <ESKEPBaseHeader />
      <section className="py-5">
        <div className="container">
          <Header />
          <div className="row">
            <div className="col-md-4 col-lg-3" style={{ minWidth: "280px" }}>
              <Sidebar />
            </div>
            <div className="col-lg-8">
              <div className="card shadow border-0">
                <div className="card-header bg-primary text-white">
                  <h3 className="mb-0">Koordinatör Yönetimi</h3>
                </div>
                <div className="card-body p-4">
                  {message && (
                    <div
                      className={`alert alert-${messageType === "success" ? "success" : "danger"}`}
                    >
                      {message}
                    </div>
                  )}

                  <form onSubmit={handleRoleUpdate} className="mb-4">
                    <h5 className="text-primary">Koordinatör Rolü Güncelle</h5>
                    <div className="row">
                      <div className="col-md-6 mt-2">
                        <select
                          className="form-control"
                          value={selectedCoordinator}
                          onChange={(e) =>
                            setSelectedCoordinator(e.target.value)
                          }
                        >
                          <option value="">Koordinatör Seç</option>
                          {coordinators.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.full_name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6 mt-2">
                        <select
                          className="form-control"
                          value={selectedRole}
                          onChange={(e) => setSelectedRole(e.target.value)}
                        >
                          <option value="">Rol Seç</option>
                          <option value="Ogrenci">Öğrenci Koordinatörü</option>
                          <option value="Stajer">Stajyer Koordinatörü</option>
                        </select>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="btn btn-success mt-3 w-100"
                    >
                      Rolü Güncelle
                    </button>
                  </form>

                  <form
                    onSubmit={formik.handleSubmit}
                    className="border-top pt-4"
                  >
                    <h5 className="text-info">Yeni Stajer / Öğrenci Oluştur</h5>
                    <div className="row">
                      <div className="col-md-6">
                        <select
                          name="role"
                          className="form-control mt-2"
                          value={formik.values.role}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        >
                          <option value="">Kullanıcı Tipi Seç</option>
                          <option value="Ogrenci">Öğrenci</option>
                          <option value="Stajer">Stajyer</option>
                        </select>
                        {formik.touched.role && formik.errors.role && (
                          <div className="text-danger">
                            {formik.errors.role}
                          </div>
                        )}

                        <input
                          name="full_name"
                          className="form-control mt-2"
                          placeholder="Ad Soyad"
                          value={formik.values.full_name}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                        {formik.touched.full_name &&
                          formik.errors.full_name && (
                            <div className="text-danger">
                              {formik.errors.full_name}
                            </div>
                          )}

                        <input
                          name="evtel"
                          className="form-control mt-2"
                          placeholder="Ev Telefonu"
                          value={formik.values.evtel}
                          onChange={formik.handleChange}
                        />

                        <InputMask
                          mask="(999) 999-9999"
                          value={formik.values.ceptel}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        >
                          {(inputProps) => (
                            <input
                              {...inputProps}
                              name="ceptel"
                              className="form-control mt-2"
                              placeholder="Cep Telefonu"
                            />
                          )}
                        </InputMask>
                        {formik.touched.ceptel && formik.errors.ceptel && (
                          <div className="text-danger">
                            {formik.errors.ceptel}
                          </div>
                        )}

                        <select
                          name="instructor"
                          className="form-control mt-2"
                          value={formik.values.instructor || ""}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        >
                          <option value="">Koordinatör Seç</option>
                          {filteredCoordinators.map((k) => (
                            <option key={k.id} value={k.id}>
                              {k.full_name}
                            </option>
                          ))}
                        </select>
                        {formik.touched.instructor &&
                          formik.errors.instructor && (
                            <div className="text-danger">
                              {formik.errors.instructor}
                            </div>
                          )}
                      </div>

                      <div className="col-md-6">
                        <input
                          name="istel"
                          className="form-control mt-2"
                          placeholder="İş Telefonu"
                          value={formik.values.istel}
                          onChange={formik.handleChange}
                        />

                        <input
                          name="email"
                          className="form-control mt-2"
                          placeholder="E-posta"
                          type="email"
                          value={formik.values.email}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                        {formik.touched.email && formik.errors.email && (
                          <div className="text-danger">
                            {formik.errors.email}
                          </div>
                        )}

                        <select
                          name="gender"
                          className="form-control mt-2"
                          value={formik.values.gender}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        >
                          <option value="">Cinsiyet Seç</option>
                          <option value="Erkek">Erkek</option>
                          <option value="Kadın">Kadın</option>
                        </select>
                        {formik.touched.gender && formik.errors.gender && (
                          <div className="text-danger">
                            {formik.errors.gender}
                          </div>
                        )}
                        <input
                          name="active"
                          type="checkbox"
                          checked={formik.values.active}
                          readOnly
                          disabled
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-info mt-3 w-100"
                      disabled={formik.isSubmitting}
                    >
                      {formik.isSubmitting
                        ? "Gönderiliyor..."
                        : formik.values.role === "Ogrenci"
                          ? "Öğrenci Oluştur"
                          : "Stajyer Oluştur"}
                    </button>

                    {message && (
                      <div
                        className={`alert mt-3 alert-${messageType === "success" ? "success" : "danger"}`}
                      >
                        {message}
                      </div>
                    )}
                  </form>

                  <hr className="my-4" />
                  <h5 className="text-secondary">Dışa Aktar</h5>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-outline-primary"
                      onClick={() => exportToExcel(students, "ogrenci_listesi")}
                    >
                      Öğrenci Excel
                    </button>
                    <button
                      className="btn btn-outline-warning"
                      onClick={() => exportToExcel(interns, "stajyer_listesi")}
                    >
                      Stajyer Excel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <ESKEPBaseFooter />
    </>
  );
}

export default AssignCoordinator;
