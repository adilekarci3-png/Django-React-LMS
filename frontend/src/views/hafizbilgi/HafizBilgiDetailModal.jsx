import { useEffect, useState } from "react";
import useAxios from "../../utils/useAxios";
import { useAuthStore } from "../../store/auth";

function HafizBilgiDetailModal({ item, onClose }) {
  const api = useAxios();
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [countries, setCountries] = useState([]);
  const [agents, setAgents] = useState([]);

  const [baseRoles, subRoles] = useAuthStore((state) => [
    state.allUserData?.base_roles || [],
    state.allUserData?.sub_roles || []
  ]);
  const isAgentUser = baseRoles.includes("Agent");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [c, d, j, co, a] = await Promise.all([
          api.get("/city/list/"),
          api.get("/district/list/"),
          api.get("/job/list/"),
          api.get("/country/list/"),
          api.get("/agent/list/")
        ]);
        setCities(c.data);
        setDistricts(d.data);
        setJobs(j.data);
        setCountries(co.data);
        setAgents(a.data);
      } catch (err) {
        console.error("Veri çekme hatası:", err);
      }
    };
    fetchAll();
  }, []);

  if (!item) return null;

  const cityName = cities.find(c => c.id === item.adresIl)?.name || "-";
  const districtName = districts.find(d => d.id === item.adresIlce)?.name || "-";
  const courseCityName = cities.find(c => c.id === item.hafizlikyaptigikursili)?.name || "-";
  const jobName = jobs.find(j => j.id === item.job)?.name || "-";
  const countryName = countries.find(c => c.id === item.country)?.name || "-";
  const agentName = agents.find(a => a.id === item.agent)?.full_name || "-";

  const renderField = (label, value) => (
    <div className="col-md-6">
      <label className="form-label fw-bold">{label}</label>
      <input type="text" className="form-control" value={value || "-"} readOnly />
    </div>
  );

  const renderTextarea = (label, value) => (
    <div className="col-12">
      <label className="form-label fw-bold">{label}</label>
      <textarea className="form-control" value={value || "-"} rows={3} readOnly />
    </div>
  );

  return (
    <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: "#00000099" }}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header">
            <h5 className="modal-title">Hafız Detayı</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="row g-3">
              {renderField("Ad Soyad", item.full_name)}
              {renderField("Baba Adı", item.babaadi)}
              {renderField("TC No", item.tcno)}
              {renderField("Cep Tel", item.ceptel)}
              {renderField("Ev Tel", item.evtel)}
              {renderField("İş Tel", item.istel)}
              {renderField("Email", item.email)}
              {renderField("Adres", item.adres)}
              {renderField("İl", cityName)}
              {renderField("İlçe", districtName)}
              {renderField("Hafızlık Bitirme Yılı", item.hafizlikbitirmeyili)}
              {renderField("Evli mi?", item.isMarried)}
              {renderField("Cinsiyet", item.gender)}
              {renderField("Yaş", item.yas)}
              {renderField("Hafızlık Yaptığı Kurs Adı", item.hafizlikyaptigikursadi)}
              {renderField("Hafızlık Kurs İli", courseCityName)}
              {renderField("Görev", item.gorev)}
              {renderField("Hoca Adı", item.hafizlikhocaadi)}
              {renderField("Hoca Soyadı", item.hafizlikhocasoyadi)}
              {renderField("Hoca Tel", item.hafizlikhocaceptel)}
              {renderField("Arkadaş Adı", item.hafizlikarkadasadi)}
              {renderField("Arkadaş Soyadı", item.hafizlikarkadasoyad)}
              {renderField("Arkadaş Tel", item.hafizlikarkadasceptel)}
              {renderField("Referans TC", item.referanstcno)}
              {renderField("Onay Durumu", item.onaydurumu)}
              {renderField("Aktif mi?", item.active ? "Evet" : "Hayır")}
              {renderField("İş", jobName)}
              {renderField("Ülke", countryName)}
              {renderField("Eğitmen", agentName)}
              {renderTextarea("Açıklama", item.description)}
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HafizBilgiDetailModal;
