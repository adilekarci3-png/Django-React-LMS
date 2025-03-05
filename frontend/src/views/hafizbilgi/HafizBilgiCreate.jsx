import { useState, useEffect } from "react";
import axios from "axios";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { InputLabel, TextField, Button, Select, MenuItem } from "@mui/material";

function HafizBilgiCreate() {
  const [hafizBilgi, setHafizBilgi] = useState({
    babaadi: "",
    tcno: "",
    adres: "",
    evtel: "",
    istel: "",
    ceptel: "",
    isMarried: "",
    email: "",
    hafizlikyaptigikursadi: "",
    gorev: "",
    hafizlikhocaadi: "",
    hafizlikhocasoyadi: "",
    hafizlikhocaceptel: "",
    hafizlikarkadasadi: "",
    hafizlikarkadasoyad: "",
    hafizlikarkadasceptel: "",
    referanstcno: "",
    onaydurumu: "onaylanmadi",
    description: "",
    gender: "erkek",
    yas: -1,
    active: true,
    country: 1,
  });

  const [iller, setIller] = useState([]);
  const [ilceler, setIlceler] = useState([]);
  const [yillar, setYillar] = useState([]);
  const [meslekler, setMeslekler] = useState([]);
  const [adresil, setAdresIl] = useState("");
  const [adresilce, setAdresIlce] = useState("");
  const [kursil, setKursIl] = useState("");
  const [kursadı, setKursAdi] = useState("");
  const [adiSoyadi, setAdiSoyadi] = useState("");
  const [cepTel, setCepTel] = useState("");
  const [meslek, setMeslek] = useState("");
  const [yil, setYil] = useState(0);
  const [cinsiyet, setCinsiyet] = useState("");
  const [email, setEmail] = useState("");
  const [progress, setProgress] = useState(0);
  const [ckEdtitorData, setCKEditorData] = useState("");

  const fetchMesleks = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/v1/job/list/");
      setMeslekler(res.data);
    } catch (error) {
      console.error("Meslekler alınamadı", error);
    }
  };

  const fetchIller = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/v1/city/list/");
      setIller(res.data);
    } catch (error) {
      console.error("İller alınamadı", error);
    }
  };

  const fetchIlceler = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/v1/district/list/");
      setIlceler(res.data);
    } catch (error) {
      console.error("İlçeler alınamadı", error);
    }
  };

  const fetchYillar = () => {
    const Yillar = [];
    const nowYear = new Date().getFullYear();
    for (let i = 1930; i <= nowYear; i++) {
      Yillar.push(i);
    }
    setYillar(Yillar);
  };

  useEffect(() => {
    fetchIller();
    fetchMesleks();
    fetchYillar();
    fetchIlceler();
  }, []);

  const handleMeslekChange = (event) => setMeslek(event.target.value);

  const handleCinsiyetChange = (event) => {
    const value = event.target.value;
    setCinsiyet(value === "10" ? "Erkek" : "Kadın");
  };

  const handleAdresIlChange = async (event) => {
    setAdresIl(event);
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/v1/district/list/");
      const filteredDistricts = res.data.filter(
        (district) => district.city?.id === event
      );
      setIlceler(filteredDistricts);
    } catch (error) {
      console.error("İlçe verisi alınamadı", error);
    }
  };

  const handleAdresIlceChange = (event) => setAdresIlce(event.target.value);

  const handleKursIlChange = (event) => setKursIl(event.target.value);

  const handleYilChange = (event) => setYil(event.target.value);

  const handleCkEditorChange = (event, editor) => {
    const data = editor.getData();
    setCKEditorData(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formdata = new FormData();
    formdata.append("full_name", adiSoyadi);
    formdata.append("adresIl", adresil);
    formdata.append("adresIlce", adresilce);
    formdata.append("hafizlikbitirmeyili", yil);
    formdata.append("ceptel", cepTel);
    formdata.append("email", email);
    formdata.append("hafizlikyaptigikursili", kursil);
    formdata.append("hafizlikyaptigikursadi", kursadı);
    formdata.append("gender", cinsiyet);
    formdata.append("job", meslek);
    formdata.append("babaadi", hafizBilgi.babaadi);
    formdata.append("tcno", hafizBilgi.tcno);
    formdata.append("adres", hafizBilgi.adres);
    formdata.append("evtel", hafizBilgi.evtel);
    formdata.append("istel", hafizBilgi.istel);
    formdata.append("isMarried", hafizBilgi.isMarried);
    formdata.append("gorev", hafizBilgi.gorev);
    formdata.append("hafizlikhocaadi", hafizBilgi.hafizlikhocaadi);
    formdata.append("hafizlikhocasoyadi", hafizBilgi.hafizlikhocasoyadi);
    formdata.append("hafizlikhocaceptel", hafizBilgi.hafizlikhocaceptel);
    formdata.append("hafizlikarkadasadi", hafizBilgi.hafizlikarkadasadi);
    formdata.append("hafizlikarkadasoyad", hafizBilgi.hafizlikarkadasoyad);
    formdata.append("hafizlikarkadasceptel", hafizBilgi.hafizlikarkadasceptel);
    formdata.append("referanstcno", hafizBilgi.referanstcno);
    formdata.append("onaydurumu", hafizBilgi.onaydurumu);
    formdata.append("description", ckEdtitorData);
    formdata.append("active", hafizBilgi.active);
    formdata.append("country", hafizBilgi.country);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/v1/hafizbilgi/create/",
        formdata
      );
      Swal.fire({
        icon: "success",
        title: "Bilgileriniz Başarıyla Kaydedildi",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Kayıt işlemi sırasında bir hata oluştu.",
      });
    }
  };

  return (
    <>
      <BaseHeader />
      <section className="pt-5 pb-5">
        <div className="container">
          <form className="col-md-12 col-md-9 col-12" onSubmit={handleSubmit}>
            {/* Section Başlangıcı */}
            <section className="py-2 py-md-2 bg-primary rounded-3">
              <div className="container">
                <div className="row">
                  <div className="offset-md-1 col-md-10 col-md-10 col-10">
                    <div className="d-md-flex align-items-center justify-content-between">
                      <div className="mb-2 mb-md-0">
                        <h1 className="text-white mb-1">Bilgilerinizi Girin</h1>
                        <p className="mb-0 text-white lead">
                          Alanları Doldurunuz, Kayıt İşlemi tamamlandıktan sonra bilgileriniz EHAD sistemine kaydedilecektir ve bulunduğunuz ilin şube başkanları sizinle iletişime geçecektir
                        </p>
                      </div>
                      <div>
                        <Link
                          to="/"
                          className="btn"
                          style={{ backgroundColor: "white", width: "150px" }}
                        >
                          <i className="fas fa-home"></i> Ana Sayfa
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            {/* Form Başlangıcı */}
            <section className="pb-8 mt-5">
              <div className="card mb-3">
                <div className="card-header border-bottom px-4 py-3">
                  <h4 className="mb-0">Hafızlık Bilgi Sistemi Kayıt Formu</h4>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-6">
                      <TextField
                        label="Adı Soyadı"
                        onChange={(e) => setAdiSoyadi(e.target.value)}
                        variant="outlined"
                        color="secondary"
                        sx={{ mb: 3, mt: 3 }}
                        fullWidth
                        size="small"
                      />
                      <InputLabel id="demo-simple-select-label">Meslek</InputLabel>
                      <Select
                        fullWidth
                        sx={{ mb: 3 }}
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        size="small"
                        onChange={handleMeslekChange}
                      >
                        {meslekler?.map((m) => (
                          <MenuItem key={m.id} value={m.id}>
                            {m.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </div>
                    <div className="col-6">
                      <TextField
                        label="Cep Telefonu"
                        onChange={(e) => setCepTel(e.target.value)}
                        required
                        variant="outlined"
                        color="secondary"
                        type="phone"
                        size="small"
                        fullWidth
                        sx={{ mb: 3, mt: 3 }}
                      />
                      <InputLabel id="demo-simple-select-label">Cinsiyet</InputLabel>
                      <Select
                        fullWidth
                        sx={{ mb: 3 }}
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        size="small"
                        onChange={handleCinsiyetChange}
                      >
                        <MenuItem value={10}>Erkek</MenuItem>
                        <MenuItem value={20}>Kadın</MenuItem>
                      </Select>
                    </div>
                  </div>
                </div>
                {/* İletişim Bilgileri */}
                <div className="row">
                  <div className="col-6">
                    <TextField
                      label="E Posta"
                      onChange={(e) => setEmail(e.target.value)}
                      size="small"
                      variant="outlined"
                      color="secondary"
                      type="email"
                      fullWidth
                      sx={{ mb: 3, mt: 3 }}
                    />
                    <InputLabel id="demo-simple-select-label">İkamet İl</InputLabel>
                    <Select
                      fullWidth
                      sx={{ mb: 3 }}
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={adresil}
                      label="adresIl"
                      size="small"
                      onChange={(e) => handleAdresIlChange(e.target.value)}
                    >
                      {iller?.map((i) => (
                        <MenuItem key={i.id} value={i.id}>
                          {i.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </div>
                  <div className="col-6">
                    <TextField
                      label="Hafızlık Yaptığı Kurs Adı"
                      onChange={(e) => setKursAdi(e.target.value)}
                      size="small"
                      variant="outlined"
                      color="secondary"
                      fullWidth
                      sx={{ mb: 3, mt: 3 }}
                    />
                    <InputLabel id="demo-simple-select-label">İkamet İlçe</InputLabel>
                    <Select
                      fullWidth
                      sx={{ mb: 3 }}
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      size="small"
                      onChange={handleAdresIlceChange}
                    >
                      {ilceler?.map((i) => (
                        <MenuItem key={i.id} value={i.id}>
                          {i.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </div>
                </div>
                {/* Hafızlık Bilgileri */}
                <div className="row">
                  <div className="col-6">
                    <InputLabel id="demo-simple-select-label">Kurs İli</InputLabel>
                    <Select
                      fullWidth
                      sx={{ mb: 3 }}
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      label="hafizlikyaptigikursili"
                      size="small"
                      onChange={handleKursIlChange}
                    >
                      {iller?.map((i) => (
                        <MenuItem key={i.id} value={i.id}>
                          {i.name}
                        </MenuItem>
                      ))}
                    </Select>
                    <InputLabel id="demo-simple-select-label">Hafızlık Bitirme Yılı</InputLabel>
                    <Select
                      fullWidth
                      sx={{ mb: 3 }}
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      label="hafizlikbitirmeyili"
                      size="small"
                      onChange={handleYilChange}
                    >
                      {yillar?.map((y) => (
                        <MenuItem key={y} value={y}>
                          {y}
                        </MenuItem>
                      ))}
                    </Select>
                  </div>
                </div>
                <Button
                  className="btn btn-lg btn-success w-100 mt-2"
                  type="submit"
                >
                  Bilgilerinizi Kaydedin <i className="fas fa-check-circle"></i>
                </Button>
              </div>
            </section>
          </form>
        </div>
      </section>
      <BaseFooter />
    </>
  );
}

export default HafizBilgiCreate;