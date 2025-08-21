import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import useAxios from "../../utils/useAxios";
import Swal from "sweetalert2";

function EducatorEditForm({ educator, onClose, onUpdate }) {
    const api = useAxios();
    const [loading, setLoading] = useState(false);

    const [cities, setCities] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [educationLevels, setEducationLevels] = useState([]);
    const [branches, setBranches] = useState([]);

    const schema = Yup.object().shape({
        full_name: Yup.string().required("Ad Soyad zorunlu"),
        email: Yup.string().email("Geçerli e-posta giriniz").required("Email zorunlu"),
        phone: Yup.string().required("Telefon zorunlu"),
        gender: Yup.string().required("Cinsiyet zorunlu"),
        city: Yup.number().required("Şehir seçiniz"),
        district: Yup.number().required("İlçe seçiniz"),
        branch: Yup.number().required("Branş seçiniz"),
        education_level: Yup.number().required("Eğitim seviyesi seçiniz"),
        description: Yup.string(),
        active: Yup.boolean(),
    });

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
    });

    // Şehir seçildiğinde ilçeleri getir
    const selectedCity = watch("city");

    useEffect(() => {
        if (selectedCity) {
            api.get(`/district/list/?city=${selectedCity}`).then((res) => {
                setDistricts(res.data);
            });
        }
    }, [selectedCity]);

    useEffect(() => {
        // Sabit verileri çek
        const fetchOptions = async () => {
            const [cityRes, districtRes, branchRes, eduLevelRes] = await Promise.all([
                api.get("/city/list/"),
                api.get("/district/list/"),
                api.get("/branch/list/"),
                api.get("/education-level/list/"),
            ]);

            setCities(cityRes.data);
            setDistricts(districtRes.data);
            setBranches(branchRes.data);
            setEducationLevels(eduLevelRes.data);

            // Sabit veriler geldikten sonra formu doldur
            if (educator) {
                setValue("full_name", educator.full_name || "");
                setValue("email", educator.email || "");
                setValue("phone", educator.phone || "");
                setValue("gender", educator.gender || "");

                setValue("city", educator.city || "");
                setValue("district", educator.district || "");
                setValue("branch", educator.branch || "");
                setValue("education_level", educator.education_level || "");

                setValue("description", educator.description || "");
                setValue("active", educator.active ?? false);
            }
        };

        if (educator) {
            fetchOptions();
        }
    }, [educator]);


const onSubmit = async (data) => {
  setLoading(true);
  try {
    const response = await api.put(`/educator/${educator.id}/`, data);
if (onUpdate) onUpdate(response.data);
    await Swal.fire({
      icon: "success",
      title: "Güncelleme başarılı",
      text: `${response.data.full_name} başarıyla güncellendi.`,
      timer: 2000,
      showConfirmButton: false,
    });    
  } catch (error) {
    await Swal.fire({
      icon: "error",
      title: "Hata",
      text: "Eğitmen güncellenirken bir sorun oluştu.",
    });
    console.error("Güncelleme başarısız", error);
  } finally {
    setLoading(false);
  }
};

    if (!educator) return <div>Yükleniyor...</div>;

    return (
        <div className="container py-2">
            <h4 className="mb-3">Eğitmen Düzenle</h4>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-3">
                    <label>Ad Soyad</label>
                    <input className="form-control" {...register("full_name")} />
                    {errors.full_name && <span className="text-danger">{errors.full_name.message}</span>}
                </div>

                <div className="mb-3">
                    <label>Email</label>
                    <input type="email" className="form-control" {...register("email")} />
                    {errors.email && <span className="text-danger">{errors.email.message}</span>}
                </div>

                <div className="mb-3">
                    <label>Telefon</label>
                    <input className="form-control" {...register("phone")} />
                    {errors.phone && <span className="text-danger">{errors.phone.message}</span>}
                </div>

                <div className="mb-3">
                    <label>Cinsiyet</label>
                    <select className="form-select" {...register("gender")}>
                        <option value="">Seçiniz</option>
                        <option value="Erkek">Erkek</option>
                        <option value="Kadın">Kadın</option>
                    </select>
                    {errors.gender && <span className="text-danger">{errors.gender.message}</span>}
                </div>

                <div className="mb-3">
                    <label>Şehir</label>
                    <select className="form-select" {...register("city")}>
                        <option value="">Seçiniz</option>
                        {cities.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                    {errors.city && <span className="text-danger">{errors.city.message}</span>}
                </div>

                <div className="mb-3">
                    <label>İlçe</label>
                    <select className="form-select" {...register("district")}>
                        <option value="">Seçiniz</option>
                        {districts.map((d) => (
                            <option key={d.id} value={d.id}>
                                {d.name}
                            </option>
                        ))}
                    </select>
                    {errors.district && <span className="text-danger">{errors.district.message}</span>}
                </div>

                <div className="mb-3">
                    <label>Branş</label>
                    <select className="form-select" {...register("branch")}>
                        <option value="">Seçiniz</option>
                        {branches.map((b) => (
                            <option key={b.id} value={b.id}>
                                {b.name}
                            </option>
                        ))}
                    </select>
                    {errors.branch && <span className="text-danger">{errors.branch.message}</span>}
                </div>

                <div className="mb-3">
                    <label>Eğitim Seviyesi</label>
                    <select className="form-select" {...register("education_level")}>
                        <option value="">Seçiniz</option>
                        {educationLevels.map((e) => (
                            <option key={e.id} value={e.id}>
                                {e.name}
                            </option>
                        ))}
                    </select>
                    {errors.education_level && <span className="text-danger">{errors.education_level.message}</span>}
                </div>

                <div className="mb-3">
                    <label>Açıklama</label>
                    <textarea className="form-control" rows={3} {...register("description")} />
                </div>

                <div className="form-check mb-3">
                    <input type="checkbox" className="form-check-input" {...register("active")} />
                    <label className="form-check-label">Aktif mi?</label>
                </div>

                <div className="d-flex justify-content-between">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>
                        İptal
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? "Kaydediliyor..." : "Kaydet"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default EducatorEditForm;
