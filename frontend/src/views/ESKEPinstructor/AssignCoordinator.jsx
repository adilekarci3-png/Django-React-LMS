import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { IMaskInput } from "react-imask";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";
import useAxios from "../../utils/useAxios";

const schema = Yup.object().shape({
  role: Yup.string().required("Kullanıcı tipi zorunludur."),
  full_name: Yup.string().required("Ad soyad zorunludur."),
  email: Yup.string().email("Geçerli bir e-posta giriniz"),
  ceptel: Yup.string()
    .required("Cep telefonu zorunludur.")
    .test("is-filled", "Cep telefonu eksik", (val) => val && val.replace(/[^0-9]/g, "").length === 10),
  gender: Yup.string().required("Cinsiyet zorunludur."),
  coordinator_id: Yup.number()
    .transform((_, val) => (val ? +val : null))
    .typeError("Koordinatör seçimi zorunludur.")
    .required("Koordinatör seçimi zorunludur."),
});

const defaultValues = {
  role: "",
  full_name: "",
  evtel: "",
  istel: "",
  ceptel: "",
  email: "",
  gender: "",
  coordinator_id: "",
  active: false,
};

function AssignCoordinator() {
  const [coordinators, setCoordinators] = useState([]);
  const [students, setStudents] = useState([]);
  const [interns, setInterns] = useState([]);
  const [generalMessage, setGeneralMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [selectedCoordinator, setSelectedCoordinator] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedUserToAssign, setSelectedUserToAssign] = useState("");
  const api = useAxios();

  const {
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues,
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const role = watch("role");
  const matchedRoleName =
    role === "Ogrenci"
      ? "ESKEPOgrenciKoordinator"
      : role === "Stajer"
        ? "ESKEPStajerKoordinator"
        : "";

  const filteredCoordinators = coordinators.filter((c) =>
    c.roles?.some((r) => r.name === matchedRoleName)
  );

  const fetchData = async () => {
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
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onSubmit = async (data) => {
    const endpoint = data.role === "Ogrenci" ? "ogrenci/" : "stajer/";
    try {
      const response = await api.post(endpoint, data);
      setGeneralMessage(
        `${data.role === "Ogrenci" ? "Öğrenci" : "Stajyer"} başarıyla oluşturuldu.`
      );
      setMessageType("success");
      if (data.role === "Ogrenci") {
        setStudents((prev) => [...prev, response.data]);
      } else {
        setInterns((prev) => [...prev, response.data]);
      }
      reset();
    } catch (err) {
      setGeneralMessage("Kullanıcı oluşturulurken hata oluştu.");
      setMessageType("error");
    }
  };

  const handleRoleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedCoordinator || !selectedRole) {
      setGeneralMessage("Lütfen koordinatör ve rol seçiniz.");
      setMessageType("error");
      return;
    }
    try {
      await api.post("/eskep/update_coordinator_role", {
        coordinator_id: selectedCoordinator,
        role: selectedRole,
      });
      setGeneralMessage("Koordinatör rolü başarıyla güncellendi.");
      setMessageType("success");
      fetchData();
    } catch (error) {
      console.error(error);
      setGeneralMessage("Rol güncelleme sırasında hata oluştu.");
      setMessageType("error");
    }
  };

  const handleUserAssign = async (e) => {
    e.preventDefault();
    if (!selectedCoordinator || !selectedUserToAssign || !selectedRole) {
      setGeneralMessage("Tüm alanlar doldurulmalıdır.");
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
      setGeneralMessage("Eşleştirme başarıyla yapıldı.");
      setMessageType("success");
    } catch (err) {
      console.error(err);
      setGeneralMessage("Eşleştirme sırasında hata oluştu.");
      setMessageType("error");
    }
  };

  const exportToExcel = (data, fileName) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sayfa1");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `${fileName}.xlsx`);
  };

  return (
    <>
      <ESKEPBaseHeader />
      {/* EskepInstructorDashboard ile aynı iskelet */}
      <section className="pt-4 pb-5">
        <div className="container-xxl">
          <Header />
          <div className="row g-4">
            {/* SOL: sidebar */}
            <div className="col-12 col-lg-3 col-xl-3">
              <Sidebar />
            </div>

            {/* SAĞ: içerik */}
            <div className="col-12 col-lg-9 col-xl-9">
              <div className="card shadow border-0 rounded-4">
                <div className="card-header bg-primary text-white rounded-top-4">
                  <h3 className="mb-0">Koordinatör Yönetimi</h3>
                </div>
                <div className="card-body p-4">
                  {generalMessage && (
                    <div
                      className={`alert alert-${
                        messageType === "success" ? "success" : "danger"
                      }`}
                    >
                      {generalMessage}
                    </div>
                  )}

                  {/* 1. Koordinatör rolü güncelle */}
                  <form onSubmit={handleRoleUpdate} className="mb-4">
                    <h5 className="text-primary">Koordinatör Rolü Güncelle</h5>
                    <div className="row">
                      <div className="col-md-6 mt-2">
                        <select
                          className="form-control"
                          value={selectedCoordinator}
                          onChange={(e) => setSelectedCoordinator(e.target.value)}
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
                    <button type="submit" className="btn btn-success mt-3 w-100">
                      Rolü Güncelle
                    </button>
                  </form>

                  {/* 2. Yeni öğrenci/stajyer oluştur */}
                  <form onSubmit={handleSubmit(onSubmit)} className="border-top pt-4">
                    <h5 className="text-info">Yeni Stajer / Öğrenci Oluştur</h5>
                    <div className="row">
                      <div className="col-md-6">
                        <Controller
                          name="role"
                          control={control}
                          render={({ field }) => (
                            <select className="form-control mt-2" {...field}>
                              <option value="">Kullanıcı Tipi Seç</option>
                              <option value="Ogrenci">Öğrenci</option>
                              <option value="Stajer">Stajyer</option>
                            </select>
                          )}
                        />
                        {errors.role && (
                          <div className="text-danger">{errors.role.message}</div>
                        )}

                        <Controller
                          name="full_name"
                          control={control}
                          render={({ field }) => (
                            <input
                              className="form-control mt-2"
                              placeholder="Ad Soyad"
                              {...field}
                            />
                          )}
                        />
                        {errors.full_name && (
                          <div className="text-danger">
                            {errors.full_name.message}
                          </div>
                        )}

                        <Controller
                          name="evtel"
                          control={control}
                          render={({ field }) => (
                            <input
                              className="form-control mt-2"
                              placeholder="Ev Telefonu"
                              {...field}
                            />
                          )}
                        />

                        <Controller
                          name="ceptel"
                          control={control}
                          render={({ field }) => (
                            <IMaskInput
                              {...field}
                              mask="(000) 000-0000"
                              className="form-control mt-2"
                              placeholder="Cep Telefonu"
                            />
                          )}
                        />
                        {errors.ceptel && (
                          <div className="text-danger">{errors.ceptel.message}</div>
                        )}

                        <Controller
                          name="coordinator_id"
                          control={control}
                          render={({ field }) => (
                            <select className="form-control mt-2" {...field}>
                              <option value="">Koordinatör Seç</option>
                              {filteredCoordinators.map((coord) => (
                                <option key={coord.id} value={coord.id}>
                                  {coord.full_name}
                                </option>
                              ))}
                            </select>
                          )}
                        />
                        {/* burası yanlış alana bakıyordu, düzelttik */}
                        {errors.coordinator_id && (
                          <div className="text-danger">
                            {errors.coordinator_id.message}
                          </div>
                        )}
                      </div>

                      <div className="col-md-6">
                        <Controller
                          name="istel"
                          control={control}
                          render={({ field }) => (
                            <input
                              className="form-control mt-2"
                              placeholder="İş Telefonu"
                              {...field}
                            />
                          )}
                        />

                        <Controller
                          name="email"
                          control={control}
                          render={({ field }) => (
                            <input
                              type="email"
                              className="form-control mt-2"
                              placeholder="E-posta"
                              {...field}
                            />
                          )}
                        />
                        {errors.email && (
                          <div className="text-danger">{errors.email.message}</div>
                        )}

                        <Controller
                          name="gender"
                          control={control}
                          render={({ field }) => (
                            <select className="form-control mt-2" {...field}>
                              <option value="">Cinsiyet Seç</option>
                              <option value="Erkek">Erkek</option>
                              <option value="Kadın">Kadın</option>
                            </select>
                          )}
                        />
                        {errors.gender && (
                          <div className="text-danger">{errors.gender.message}</div>
                        )}

                        <Controller
                          name="active"
                          control={control}
                          render={({ field }) => (
                            <div className="form-check mt-3">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                {...field}
                                disabled
                              />
                              <label className="form-check-label ms-2">
                                Aktif (otomatik)
                              </label>
                            </div>
                          )}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-info mt-3 w-100"
                      disabled={isSubmitting}
                    >
                      {isSubmitting
                        ? "Gönderiliyor..."
                        : role === "Ogrenci"
                          ? "Öğrenci Oluştur"
                          : "Stajyer Oluştur"}
                    </button>
                  </form>

                  <hr className="my-4" />
                  <h5 className="text-secondary">Dışa Aktar</h5>
                  <div className="d-flex gap-2 flex-wrap">
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
            {/* /SAĞ */}
          </div>
        </div>
      </section>
      <ESKEPBaseFooter />
    </>
  );
}

export default AssignCoordinator;
