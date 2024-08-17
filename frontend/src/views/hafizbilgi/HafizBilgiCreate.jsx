import { useState, useEffect } from "react";
import axios from "axios";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";
import { Link } from "react-router-dom";

import useAxios from "../../utils/useAxios";
import UserData from "../plugin/UserData";
import Swal from "sweetalert2";
import {
  MRT_EditActionButtons,
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";

import { MRT_Localization_TR } from 'material-react-table/locales/tr';
import {
  InputLabel,
  TextField,
  Button,
  Select,
  MenuItem
} from "@mui/material";

import SelectInput from "@mui/material/Select/SelectInput";

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
  country:1
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
  // const [progress, setProgress] = useState(0);
  const [ckEdtitorData, setCKEditorData] = useState("");

  const FetchMesleks = () => {
    axios.get(`http://127.0.0.1:8000/api/v1/job/list/`)
      .then((res) => {
        setMeslekler(res.data);
      });
  };
  const fetchIller = () => {
    axios.get(`http://127.0.0.1:8000/api/v1/city/list/`)
      .then((res) => {
        setIller(res.data);
      });
  };
  const fetchIlceler = () => {    
    axios.get(`http://127.0.0.1:8000/api/v1/district/list/`)
      .then((res) => {              
        setIlceler(res.data);
      });
      
  };
  console.log(ilceler);
  const fetchYillar = () => {    
    var Yillar = []
    var nowYear = new Date().getFullYear();
    for (var i = 1930; i <= nowYear; i++) {
      Yillar.push(i);
    }
    setYillar(Yillar)
  };
  
  useEffect(() => {
    fetchIller();
    FetchMesleks();
    fetchYillar();
    fetchIlceler();
  },[]);

  const handleMeslekChange = (event) => {
    debugger;
    const data = event.target.value;       
    setMeslek(data);    
  };
  
  const handleCinsiyetChange = (event) => {
    debugger;
    const data = event.target.value;
    if(data==10)
      {setCinsiyet("Erkek");} 
    else{
      setCinsiyet("Kadın");
    }   
  };

  console.log(cinsiyet);

  const handleAdresIlChange = (event) => {
    debugger;
    const data = event;       
    setAdresIl(data);

    var temp = []; 
    var IlIlce = []; 
    axios.get(`http://127.0.0.1:8000/api/v1/district/list/`)
      .then((res) => {  
        debugger;
        temp = res.data;      
        for (var i = 0; i < temp.length; i++) {          
          if(temp[i].city != null && temp[i].city.id == event){
            IlIlce.push(temp[i]);
          }      
         } 
         setIlceler(IlIlce); 
      }); 
    console.log(ilceler);   
  };
  console.log(adresil);   

  const handleAdresIlceChange = (event) => {
    debugger;
    const data = event.target.value;    
    setAdresIlce(data);
  };
  console.log(adresilce); 
  const handleKursIlChange = (event) => {
    debugger;
    const data = event.target.value;    
    setKursIl(data);
  };

  console.log(kursil);

 
  const handleYilChange = (event) => {
    debugger;
    const data = event.target.value;
    setYil(data);
  };
  console.log(yil);

  const handleCkEditorChange = (event, editor) => {
    const data = editor.getData();
    setCKEditorData(data);
    console.log(ckEdtitorData);
  };



  const handleSubmit = async (e) => {
    try{ debugger;
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
      formdata.append("full_name", adiSoyadi);
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
      formdata.append("description", hafizBilgi.description);
      formdata.append("active", hafizBilgi.active);  
      formdata.append("agent", hafizBilgi.agent);
      formdata.append("country", hafizBilgi.country);
      // console.log(hafizBilgi.category);
      // if (hafizBilgi.file !== null || hafizBilgi.file !== "") {
      //   formdata.append("file", hafizBilgi.file || "");
      // }
  
      const response = await axios.post(`http://127.0.0.1:8000/api/v1/hafizbilgi/create/`, formdata);
      console.log(response.data);
      Swal.fire({
        icon: "success",
        title: "Bilgileriniz Başarılı Bir Şekilde Kaydedildi"
      })}
    catch{
      Swal.fire({
        icon: "error",
        title: "Girdiğiniz cep telefonu yada E-posta adresi ile daha önce kayıt yapılmıştır"
      })
    }
   
  };

  return (
    <>
      <BaseHeader />

      <section className="pt-5 pb-5">
        <div className="container">
          <form className="col-md-12 col-md-9 col-12" onSubmit={handleSubmit}>
            <>
              <section className="py-4 py-md-6 bg-primary rounded-3">
                <div className="container">
                  <div className="row">
                    <div className="offset-md-1 col-md-10 col-md-10 col-10">
                      <div className="d-md-flex align-items-center justify-content-between">
                        {/* Content */}
                        <div className="mb-4 mb-md-0">
                          <h1 className="text-white mb-1">Bilgilerinizi Girin</h1>
                          <p className="mb-0 text-white lead">
                            Alanları Doldurunuz, Kayıt İşlemi tamamlandıktan sonra bilgileriniz EHAD sistemine kaydedilecektir ve bulunduğunuz ilin şube başkanları sizinle iletişime geçecektir
                          </p>
                        </div>
                        <div>
                          <Link
                            to="/"
                            className="btn"
                            style={{ backgroundColor: "white" }}
                          >
                            {" "}
                            <i className="fas fa-arrow-left"></i> Ana Sayfa
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              <section className="pb-8 mt-5">
                <div className="card mb-3">
                  {/* Basic Info Section */}
                  <div className="card-header border-bottom px-4 py-3">
                    <h4 className="mb-0">Hafızlık Bilgi Sistemi Kayıt Formu</h4>
                  </div>
                  <div className="card-body">
                    <form autoComplete="off" onSubmit={handleSubmit}>
                      <div className="card-header border-bottom px-3 py-2">
                        <h6 className="mb-0">Kişisel Bilgiler</h6>
                      </div>
                      <section className="pb-8">
                        <div className="row">
                          <div className="col-6">
                            <TextField
                              label="Adı Soyadı"
                              onChange={e => setAdiSoyadi(e.target.value)}                              
                              variant="outlined"
                              color="secondary"                              
                              sx={{ mb: 3, mt: 3 }}
                              fullWidth
                              size="small"
                            // value={email}
                            // error={emailError}
                            />
                            <InputLabel id="demo-simple-select-label">Meslek</InputLabel>
                            <Select fullWidth sx={{ mb: 3 }}
                              labelId="demo-simple-select-label"
                              id="demo-simple-select"
                              // value={age}
                              label="Meslek"
                              size="small"
                              onChange={handleMeslekChange}
                            >
                              {meslekler?.map((m) => (
                                <MenuItem value={m.id}>{m.name}</MenuItem>
                              ))}
                            </Select>
                          </div>
                          <div className="col-6">
                            <TextField
                              label="Cep Telefonu"
                              onChange={e => setCepTel(e.target.value)}
                              required
                              variant="outlined"
                              color="secondary"
                              type="phone"
                              size="small"
                              // value={password}
                              // error={passwordError}
                              fullWidth
                              sx={{ mb: 3, mt: 3 }}
                            />
                            <InputLabel id="demo-simple-select-label">Cinsiyet</InputLabel>
                            <Select fullWidth sx={{ mb: 3 }}
                              labelId="demo-simple-select-label"
                              id="demo-simple-select"
                              // value={age}
                              label="Cinsiyet"
                              size="small"
                              onChange={handleCinsiyetChange}
                            >
                              <MenuItem value={10}>Erkek</MenuItem>
                              <MenuItem value={20}>Kadın</MenuItem>
                            </Select>
                          </div>
                        </div>
                      </section>
                      <div className="card-header border-bottom px-3 py-2">
                        <h6 className="mb-0">İletişim Bilgileri</h6>
                      </div>
                      <section className="pb-8">
                        <div className="row">
                          <div className="col-6">
                            <TextField
                              label="E Posta"
                              onChange={e => setEmail(e.target.value)}
                              size="small"
                              variant="outlined"
                              color="secondary"
                              type="email"
                              // value={password}
                              // error={passwordError}
                              fullWidth
                              sx={{ mb: 3, mt: 3 }}
                            />
                            <InputLabel id="demo-simple-select-label">İkamet İl</InputLabel>
                            <Select fullWidth sx={{ mb: 3 }}
                              labelId="demo-simple-select-label"
                              id="demo-simple-select"
                              value={this}
                              label="adresIl"
                              size="small"                              
                              onChange={e => handleAdresIlChange(e.target.value)}                                                          
                            >
                              {iller?.map((i) => (
                                <MenuItem value={i.id}>{i.name}</MenuItem>
                              ))}
                            </Select>
                          </div>
                          <div className="col-6">
                            <TextField
                              label="Hafızlık Yaptığı Kurs Adı"
                              onChange={e => setKursAdi(e.target.value)}
                              size="small"
                              variant="outlined"
                              color="secondary"
                              // type="email"
                              // value={password}
                              // error={passwordError}
                              fullWidth
                              sx={{ mb: 3, mt: 3 }}
                            />
                           <InputLabel id="demo-simple-select-label">İkamet İlçe</InputLabel>
                              <Select fullWidth sx={{ mb: 3 }}
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                // value={age}
                                label="adresIlce"
                                size="small"
                                onChange={handleAdresIlceChange}
                              >
                                {ilceler?.map((i) => (
                                <MenuItem value={i.id}>{i.name}</MenuItem>
                              ))}
                              </Select>
                          </div>
                        </div>
                        <div className="card-header border-bottom px-3 py-2">
                          <h6 className="mb-0">Hafızlık Bilgileri</h6>
                        </div>
                        <section className="pb-8">
                          <div className="row">
                            <div className="col-6">
                              <InputLabel id="demo-simple-select-label">Kurs İli</InputLabel>
                              <Select fullWidth sx={{ mb: 3 }}
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                // value={age}
                                label="hafizlikyaptigikursili"
                                size="small"
                                onChange={handleKursIlChange}
                              >
                                {iller?.map((i) => (
                                  <MenuItem value={i.id}>{i.name}</MenuItem>
                                ))}
                              </Select>
                              <InputLabel id="demo-simple-select-label">Hafızlık Bitirme Yılı</InputLabel>
                            <Select fullWidth sx={{ mb: 3 }}
                              labelId="demo-simple-select-label"
                              id="demo-simple-select"
                              // value={age}
                              label="hafizlikbitirmeyili"
                              size="small"
                              onChange={handleYilChange}
                            >
                               {yillar?.map((y) => (
                                <MenuItem value={y}>{y}</MenuItem>
                              ))}
                            </Select>
                             
                            </div>
                          </div>
                        </section>
                        <button
                          className="btn btn-lg btn-success w-100 mt-2"
                          type="submit" onClick={handleSubmit}
                        >
                          Bilgilerinizi Kaydedin <i className="fas fa-check-circle"></i>
                        </button>
                      </section>

                    </form>

                  </div>

                </div>
              </section>
            </>
          </form>
        </div>
      </section>

      <BaseFooter />
    </>
  );
}

export default HafizBilgiCreate;
