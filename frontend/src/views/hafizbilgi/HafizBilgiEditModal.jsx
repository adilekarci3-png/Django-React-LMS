import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import useAxios from "../../utils/useAxios";
import { useEffect, useState } from "react";

function HafizBilgiEditModal({ item, onClose, onSuccess }) {
  const api = useAxios();
  const isEdit = !!item;

  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [agents, setAgents] = useState([]);
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const [j, c, d, co, a] = await Promise.all([
        api.get("http://localhost:8000/api/v1/job/list/"),
        api.get("http://localhost:8000/api/v1/city/list/"),
        api.get("http://localhost:8000/api/v1/district/list/"),
        api.get("http://localhost:8000/api/v1/country/list/"),
        api.get("http://localhost:8000/api/v1/agent/list/"),
      ]);

      console.log("Cities:", c.data);
      console.log("Districts:", d.data);
      console.log("Jobs:", j.data);
      console.log("Agents:", a.data);
      console.log("Countries:", co.data);

      setCities(c.data);
      setDistricts(d.data);
      setJobs(j.data);
      // agents verisini id ve name şeklinde dönüştür
      const mappedAgents = a.data.map((agent) => ({
        id: agent.id,
        name: agent.full_name,
      }));
      setAgents(mappedAgents);
      setCountries(co.data);
    };
    fetchData();
  }, []);

  const genderOptions = [
    { id: "Erkek", name: "Erkek" },
    { id: "Kadın", name: "Kadın" },
  ];

  const isMarriedOptions = [
    { id: "Evli", name: "Evli" },
    { id: "Bekar", name: "Bekar" },
  ];

  const onayDurumuOptions = [
    { id: "Onaylandı", name: "Onaylandı" },
    { id: "Onaylanmadı", name: "Onaylanmadı" },
  ];

  // Yıllar 1930'dan bugüne
  const year = new Date().getFullYear();
  const bitirmeYiliOptions = Array.from({ length: year - 1930 + 1 }, (_, i) => {
    const y = (year - i).toString();
    return { id: y, name: y };
  });

  const initialValues = {
    full_name: item?.full_name || "",
    babaadi: item?.babaadi || "",
    tcno: item?.tcno || "",
    adres: item?.adres || "",
    adresIl: item?.adresIl || "",
    adresIlce: item?.adresIlce || "",
    hafizlikbitirmeyili: item?.hafizlikbitirmeyili || "",
    evtel: item?.evtel || "",
    istel: item?.istel || "",
    ceptel: item?.ceptel || "",
    isMarried: item?.isMarried || "",
    email: item?.email || "",
    hafizlikyaptigikursadi: item?.hafizlikyaptigikursadi || "",
    hafizlikyaptigikursili: item?.hafizlikyaptigikursili || "",
    gorev: item?.gorev || "",
    hafizlikhocaadi: item?.hafizlikhocaadi || "",
    hafizlikhocasoyadi: item?.hafizlikhocasoyadi || "",
    hafizlikhocaceptel: item?.hafizlikhocaceptel || "",
    hafizlikarkadasadi: item?.hafizlikarkadasadi || "",
    hafizlikarkadasoyad: item?.hafizlikarkadasoyad || "",
    hafizlikarkadasceptel: item?.hafizlikarkadasceptel || "",
    referanstcno: item?.referanstcno || "",
    onaydurumu: item?.onaydurumu || "Onaylanmadı",
    description: item?.description || "",
    gender: item?.gender || "",
    job: item?.job || "",
    yas: item?.yas || "",
    active: item?.active || true,
    agent: item?.agent || "",
    country: item?.country || "",
  };

  const validationSchema = Yup.object({
  full_name: Yup.string().required("Ad Soyad zorunludur."),
  babaadi: Yup.string().required("Baba adı zorunludur."),
  tcno: Yup.string().required("TC No zorunludur."),
  adres: Yup.string().required("Adres zorunludur."),
  adresIl: Yup.number().required("İl seçimi zorunludur."),
  adresIlce: Yup.number().required("İlçe seçimi zorunludur."),
  hafizlikbitirmeyili: Yup.string().required("Hafızlık bitirme yılı zorunludur."),
  evtel: Yup.string().required("Ev telefonu zorunludur."),
  istel: Yup.string().required("İş telefonu zorunludur."),
  ceptel: Yup.string().required("Cep telefonu zorunludur."),
  isMarried: Yup.string().required("Medeni durum zorunludur."),
  });

  const handleSubmit = async (values, { setSubmitting, setStatus }) => {
    try {
      debugger;
      
      // const currentUserId = UserData()?.user_id;

      // // values.agent boşsa, login olan kullanıcıya ait agent atanır
      // if (!values.agent && agents.length > 0) {
      //   const currentAgent = agents.find((a) => a.user === currentUserId);
      //   if (currentAgent) {
      //     values.agent = currentAgent.id;
      //   }
      // }
      // Select alanları için Number dönüşümü
    const selectFields = [
      "agent",
      "adresIl",
      "adresIlce",
      "country",
      "city",
      "job"
    ];

    selectFields.forEach((field) => {
      if (values[field]) {
        values[field] = Number(values[field]);
      }
    });

    // PUT veya POST işlemi
    const agentId = Number(values.agent);
    if (isEdit) {
      await api.put(
        `http://localhost:8000/api/v1/agent/hafizbilgi-update/${agentId}/${item.id}/`,
        values
      );
    } else {
      await api.post(
        "http://localhost:8000/api/v1/hafizbilgi/create/",
        values
      );
    }
      onSuccess();
      onClose();
    } catch (err) {
      if (err.response?.data) {
        const errors = err.response.data;
        const errorMessages = Object.entries(errors)
          .map(
            ([field, msgs]) =>
              `${field}: ${Array.isArray(msgs) ? msgs.join(" ") : msgs}`
          )
          .join(" | ");
        setStatus(errorMessages);
      }
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal d-block"
      tabIndex="-1"
      style={{ backgroundColor: "#00000099" }}
    >
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {isEdit ? "Hafız Bilgisi Düzenle" : "Yeni Hafız Ekle"}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, status }) => (
                <Form className="row g-3">
                  <FieldSet label="Ad Soyad" name="full_name" />
                  <FieldSet label="Baba Adı" name="babaadi" />
                  <FieldSet label="TC No" name="tcno" />
                  <FieldSet label="Cep Tel" name="ceptel" />
                  <FieldSet label="Ev Tel" name="evtel" />
                  <FieldSet label="İş Tel" name="istel" />
                  <FieldSet label="Email" name="email" />
                  <FieldSet label="Adres" name="adres" />
                  <FieldSet
                    label="Hafızlık Kurs Adı"
                    name="hafizlikyaptigikursadi"
                  />
                  <FieldSet label="Görev" name="gorev" />

                  {/* Select alanları */}
                  <SelectField label="İl" name="adresIl" options={cities} />
                  <SelectField
                    label="İlçe"
                    name="adresIlce"
                    options={districts}
                  />
                  <SelectField
                    label="Kurs İli"
                    name="hafizlikyaptigikursili"
                    options={cities}
                  />
                  <SelectField label="İş" name="job" options={jobs} />
                  <SelectField
                    label="Ülke"
                    name="country"
                    options={countries}
                  />
                  <SelectField label="Temsilci" name="agent" options={agents} />
                  <SelectField
                    label="Cinsiyet"
                    name="gender"
                    options={genderOptions}
                  />
                  <SelectField
                    label="Evli mi?"
                    name="isMarried"
                    options={isMarriedOptions}
                  />
                  <SelectField
                    label="Onay Durumu"
                    name="onaydurumu"
                    options={onayDurumuOptions}
                  />
                  <SelectField
                    label="Hafızlık Bitirme Yılı"
                    name="hafizlikbitirmeyili"
                    options={bitirmeYiliOptions}
                  />

                  <FieldSet label="Yaş" name="yas" type="number" />
                  <FieldSet label="Açıklama" name="description" as="textarea" />
                  <FieldSet label="Hoca Adı" name="hafizlikhocaadi" />
                  <FieldSet label="Hoca Soyadı" name="hafizlikhocasoyadi" />
                  <FieldSet label="Hoca Tel" name="hafizlikhocaceptel" />
                  <FieldSet label="Arkadaş Adı" name="hafizlikarkadasadi" />
                  <FieldSet label="Arkadaş Soyadı" name="hafizlikarkadasoyad" />
                  <FieldSet label="Arkadaş Tel" name="hafizlikarkadasceptel" />
                  <FieldSet label="Referans TC" name="referanstcno" />

                  {/* Backend Hataları */}
                  {status && (
                    <div className="col-12 mt-2">
                      <div className="alert alert-danger small">{status}</div>
                    </div>
                  )}

                  {/* Butonlar */}
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={onClose}
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSubmitting}
                    >
                      {isEdit ? "Güncelle" : "Kaydet"}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </div>
  );
}

// Yardımcı bileşenler
const FieldSet = ({ label, name, type = "text", as }) => (
  <div className="col-md-6">
    <label className="form-label">{label}</label>
    <Field name={name} type={type} as={as} className="form-control" />
    <div className="text-danger small">
      <ErrorMessage name={name} />
    </div>
  </div>
);

const SelectField = ({ label, name, options }) => (
  <div className="col-md-6">
    <label className="form-label">{label}</label>
    <Field as="select" name={name} className="form-select">
      <option value="">Seçiniz</option>
      {options.map((opt) => (
        <option key={opt.id} value={opt.id}>
          {opt.name}
        </option>
      ))}
    </Field>
    <div className="text-danger small">
      <ErrorMessage name={name} />
    </div>
  </div>
);

export default HafizBilgiEditModal;
