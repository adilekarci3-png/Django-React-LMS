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
  const [kursAdi, setKursAdi] = useState("");
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
        <form className="row justify-content-center" onSubmit={handleSubmit}>
          <div className="col-md-10">
            <div className="card shadow-sm">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">Hafızlık Bilgi Sistemi Kayıt Formu</h5>
              </div>
              <div className="card-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <TextField
                      label="Adı Soyadı"
                      value={adiSoyadi}
                      onChange={(e) => setAdiSoyadi(e.target.value)}
                      fullWidth
                      size="small"
                    />
                  </div>
                  <div className="col-md-6">
                    <TextField
                      label="Cep Telefonu"
                      value={cepTel}
                      onChange={(e) => setCepTel(e.target.value)}
                      fullWidth
                      size="small"
                      type="tel"
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <InputLabel>Meslek</InputLabel>
                    <Select
                      fullWidth
                      value={meslek}
                      onChange={(e) => {
                        setMeslek(e.target.value);
                        handleMeslekChange(e);
                      }}
                      size="small"
                    >
                      {meslekler.map((m) => (
                        <MenuItem key={m.id} value={m.id}>
                          {m.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </div>
                  <div className="col-md-6">
                    <InputLabel>Cinsiyet</InputLabel>
                    <Select
                      fullWidth
                      value={cinsiyet}
                      onChange={(e) => {
                        setCinsiyet(e.target.value);
                        handleCinsiyetChange(e);
                      }}
                      size="small"
                    >
                      <MenuItem value="Erkek">Erkek</MenuItem>
                      <MenuItem value="Kadın">Kadın</MenuItem>
                    </Select>
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <InputLabel>İkamet İl</InputLabel>
                    <Select
                      fullWidth
                      value={adresil}
                      onChange={(e) => {
                        setAdresIl(e.target.value);
                        handleAdresIlChange(e.target.value);
                      }}
                      size="small"
                    >
                      {iller.map((i) => (
                        <MenuItem key={i.id} value={i.id}>
                          {i.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </div>
                  <div className="col-md-6">
                    <InputLabel>İkamet İlçe</InputLabel>
                    <Select
                      fullWidth
                      value={adresilce}
                      onChange={(e) => {
                        setAdresIlce(e.target.value);
                        handleAdresIlceChange(e);
                      }}
                      size="small"
                    >
                      {ilceler.map((i) => (
                        <MenuItem key={i.id} value={i.id}>
                          {i.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <TextField
                      label="Hafızlık Yaptığı Kurs Adı"
                      value={kursAdi}
                      onChange={(e) => setKursAdi(e.target.value)}
                      fullWidth
                      size="small"
                    />
                  </div>
                  <div className="col-md-6">
                    <InputLabel>Kurs İli</InputLabel>
                    <Select
                      fullWidth
                      value={kursil}
                      onChange={(e) => {
                        setKursIl(e.target.value);
                        handleKursIlChange(e);
                      }}
                      size="small"
                    >
                      {iller.map((i) => (
                        <MenuItem key={i.id} value={i.id}>
                          {i.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <InputLabel>Hafızlık Bitirme Yılı</InputLabel>
                    <Select
                      fullWidth
                      value={yil}
                      onChange={(e) => {
                        setYil(e.target.value);
                        handleYilChange(e);
                      }}
                      size="small"
                    >
                      {yillar.map((y) => (
                        <MenuItem key={y} value={y}>
                          {y}
                        </MenuItem>
                      ))}
                    </Select>
                  </div>
                  <div className="col-md-6">
                    <TextField
                      label="E-Posta"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      fullWidth
                      size="small"
                    />
                  </div>
                </div>

                <div className="row mb-4">
                  <div className="col-12">
                    <InputLabel>Açıklama</InputLabel>
                    <CKEditor
                      editor={ClassicEditor}
                      data={ckEdtitorData}
                      onChange={handleCkEditorChange}
                    />
                  </div>
                </div>

                <div className="d-grid">
                  <Button
                    type="submit"
                    variant="contained"
                    color="success"
                    size="large"
                  >
                    Bilgileri Kaydet
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </section>
    <BaseFooter />
    </>
  );
};

export default HafizBilgiCreate;
