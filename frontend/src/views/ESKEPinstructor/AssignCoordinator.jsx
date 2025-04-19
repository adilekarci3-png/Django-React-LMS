import React, { useState, useEffect } from "react";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import useAxios from "../../utils/useAxios";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";

function AssignCoordinator() {
  const [coordinators, setCoordinators] = useState([]);
  const [users, setUsers] = useState([]);
  const [students, setStudents] = useState([]);
  const [interns, setInterns] = useState([]);

  const [selectedCoordinator, setSelectedCoordinator] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedIntern, setSelectedIntern] = useState("");

  const [studentCoordinators, setStudentCoordinators] = useState([]);
  const [internCoordinators, setInternCoordinators] = useState([]);

  const [selectedStudentCoordinator, setStudentCoordinator] = useState("");
  const [selectedInternCoordinator, setInternCoordinator] = useState("");

  const [fullName, setFullName] = useState("");
  const [homePhone, setHomePhone] = useState("");
  const [workPhone, setWorkPhone] = useState("");
  const [mobilePhone, setMobilePhone] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const api = useAxios();

  useEffect(() => {
    async function fetchData() {
      try {
        const [coordinatorsRes, usersRes, studentsRes, internsRes] = await Promise.all([
          api.get("eskep/coordinators"),
          api.get("eskep/users/"),
          api.get("eskep/ogrencis"),
          api.get("eskep/stajers"),
        ]);

        const coordinatorsData = coordinatorsRes.data;
        setCoordinators(coordinatorsData);
        setUsers(usersRes.data);
        setStudents(studentsRes.data);
        setInterns(internsRes.data);

        setStudentCoordinators(coordinatorsData.filter((c) => c.role === "Ogrenci"));
        setInternCoordinators(coordinatorsData.filter((c) => c.role === "Stajer"));
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

  const handleAssignRole = async (e) => {
    e.preventDefault();
    if (!selectedCoordinator || !selectedRole) {
      setMessage("Koordinatör ve görev seçilmelidir.");
      setMessageType("error");
      return;
    }

    try {
      await api.put("eskep/assign-role/", {
        coordinator_id: selectedCoordinator,
        role: selectedRole === "student" ? "Ogrenci" : "Stajer",
      });
      setMessage("Görev başarıyla atandı.");
      setMessageType("success");
      window.location.reload();
    } catch (error) {
      console.error("Görev atama hatası:", error);
      setMessage("Görev atama sırasında hata oluştu.");
      setMessageType("error");
    }
  };

  const handleAssignStudent = async (e) => {
    e.preventDefault();
    if (!selectedStudentCoordinator || !selectedStudent) {
      setMessage("Koordinatör ve öğrenci seçilmelidir.");
      setMessageType("error");
      return;
    }

    try {
      await api.post("eskep/assign-student", {
        coordinator_id: selectedStudentCoordinator,
        student_id: selectedStudent,
      });
      setMessage("Öğrenci başarıyla eşleştirildi.");
      setMessageType("success");
    } catch (error) {
      console.error("Öğrenci eşleştirme hatası:", error);
      setMessage("Öğrenci eşleştirme sırasında hata oluştu.");
      setMessageType("error");
    }
  };

  const handleAssignIntern = async (e) => {
    e.preventDefault();
    if (!selectedInternCoordinator || !selectedIntern) {
      setMessage("Koordinatör ve stajyer seçilmelidir.");
      setMessageType("error");
      return;
    }

    try {
      await api.post("eskep/assign-intern", {
        coordinator_id: selectedInternCoordinator,
        intern_id: selectedIntern,
      });
      setMessage("Stajyer başarıyla eşleştirildi.");
      setMessageType("success");
    } catch (error) {
      console.error("Stajyer eşleştirme hatası:", error);
      setMessage("Stajyer eşleştirme sırasında hata oluştu.");
      setMessageType("error");
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();

    if (!fullName || !selectedRole) {
      setMessage("Ad soyad ve kullanıcı tipi zorunludur.");
      setMessageType("error");
      return;
    }

    const endpoint = selectedRole === "Ogrenci" ? "eskep/create-student" : "eskep/create-intern";

    try {
      const response = await api.post(endpoint, {
        full_name: fullName,
        home_phone: homePhone,
        work_phone: workPhone,
        mobile_phone: mobilePhone,
        email,
        gender,
      });

      setMessage(`${selectedRole === "Ogrenci" ? "Öğrenci" : "Stajyer"} başarıyla oluşturuldu.`);
      setMessageType("success");

      selectedRole === "Ogrenci"
        ? setStudents([...students, response.data])
        : setInterns([...interns, response.data]);

      setFullName("");
      setHomePhone("");
      setWorkPhone("");
      setMobilePhone("");
      setEmail("");
      setGender("");
    } catch (error) {
      console.error("Kullanıcı oluşturma hatası:", error);
      setMessage("Kullanıcı oluşturulurken hata oluştu.");
      setMessageType("error");
    }
  };

  return (
    <>
      <ESKEPBaseHeader />
      <section className="pt-5 pb-5">
        <div className="container">
          <Header />
          <div className="row mt-0 mt-md-4">
            <Sidebar />
            <div className="col-lg-9 col-md-8 col-12">
              <div className="card shadow-sm border-0">
                <div className="card-header bg-primary text-white">
                  <h3 className="mb-0">Koordinatör Yetkilendirme</h3>
                </div>
                <div className="card-body">
                  {message && (
                    <div className={`alert alert-${messageType === "success" ? "success" : "danger"}`}>
                      {message}
                    </div>
                  )}

                  <form>
                    {/* Koordinatör Atama */}
                    <h4 className="text-primary">Koordinatör Atama</h4>
                    <select className="form-control mt-2" value={selectedCoordinator} onChange={(e) => setSelectedCoordinator(e.target.value)}>
                      <option value="">Koordinatör Seç</option>
                      {coordinators.map((c) => (
                        <option key={c.id} value={c.id}>{c.full_name}</option>
                      ))}
                    </select>

                    <select className="form-control mt-2" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
                      <option value="">Görev Seç</option>
                      <option value="student">Öğrenci Koordinatörü</option>
                      <option value="intern">Stajyer Koordinatörü</option>
                    </select>

                    <button className="btn btn-primary w-100 mt-3" onClick={handleAssignRole}>Yetki Ata</button>

                    <hr />

                    {/* Öğrenci Eşleştirme */}
                    <h4 className="text-success">Öğrenci Eşleştirme</h4>
                    <select className="form-control mt-2" value={selectedStudentCoordinator} onChange={(e) => setStudentCoordinator(e.target.value)}>
                      <option value="">Koordinatör Seç</option>
                      {studentCoordinators.map((c) => (
                        <option key={c.id} value={c.id}>{c.full_name}</option>
                      ))}
                    </select>

                    <select className="form-control mt-2" value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)}>
                      <option value="">Öğrenci Seç</option>
                      {students.map((s) => (
                        <option key={s.id} value={s.id}>{s.user.full_name}</option>
                      ))}
                    </select>

                    <button className="btn btn-success w-100 mt-3" onClick={handleAssignStudent}>Öğrenci Eşleştir</button>

                    <hr />

                    {/* Stajyer Eşleştirme */}
                    <h4 className="text-warning">Stajyer Eşleştirme</h4>
                    <select className="form-control mt-2" value={selectedInternCoordinator} onChange={(e) => setInternCoordinator(e.target.value)}>
                      <option value="">Koordinatör Seç</option>
                      {internCoordinators.map((c) => (
                        <option key={c.id} value={c.id}>{c.full_name}</option>
                      ))}
                    </select>

                    <select className="form-control mt-2" value={selectedIntern} onChange={(e) => setSelectedIntern(e.target.value)}>
                      <option value="">Stajyer Seç</option>
                      {interns.map((i) => (
                        <option key={i.id} value={i.id}>{i.full_name}</option>
                      ))}
                    </select>

                    <button className="btn btn-warning w-100 mt-3" onClick={handleAssignIntern}>Stajyer Eşleştir</button>

                    <hr />

                    {/* Yeni Kullanıcı Oluştur */}
                    <h4 className="text-info">Stajer/Öğrenci Oluştur</h4>
                    <select className="form-control mt-2" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
                      <option value="">Kullanıcı Tipi Seç</option>
                      <option value="Ogrenci">Öğrenci</option>
                      <option value="Stajer">Stajyer</option>
                    </select>

                    <input className="form-control mt-2" placeholder="Ad Soyad" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                    <input className="form-control mt-2" placeholder="Ev Telefonu" value={homePhone} onChange={(e) => setHomePhone(e.target.value)} />
                    <input className="form-control mt-2" placeholder="İş Telefonu" value={workPhone} onChange={(e) => setWorkPhone(e.target.value)} />
                    <input className="form-control mt-2" placeholder="Cep Telefonu" value={mobilePhone} onChange={(e) => setMobilePhone(e.target.value)} />
                    <input className="form-control mt-2" placeholder="E-posta" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <select className="form-control mt-2" value={gender} onChange={(e) => setGender(e.target.value)}>
                      <option value="">Cinsiyet Seç</option>
                      <option value="Erkek">Erkek</option>
                      <option value="Kadın">Kadın</option>
                    </select>

                    <button className="btn btn-info w-100 mt-3" onClick={handleCreateUser}>
                      {selectedRole === "Ogrenci" ? "Öğrenci Oluştur" : "Stajyer Oluştur"}
                    </button>
                  </form>
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
