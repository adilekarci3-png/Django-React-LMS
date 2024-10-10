import { useState, useEffect, useMemo } from "react";
import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";

import UserData from "../plugin/UserData";
import fetchIller from "../CrudTable/CrudTable";
import useAxios from "../../utils/useAxios";

import Spinner from "../Spinner/Spinner";
import CrudTable from "../CrudTable/CrudTable";

import {
    Autocomplete,
    Select 
  } from "@mui/material";

function HafizBilgiList() {
    const [iller_choise, setIllerChoise] = useState([]);
    const [ilceler_choice, setIlcelerChoise] = useState([]);
    const [iller, setIller] = useState([]);
    const [ilceler, setIlceler] = useState([]);
    const [yillar, setYillar] = useState([]);
    const [hafizBilgi, setHafizBilgis] = useState([]);
    const [meslekler, setMeslekler] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [fetching, setFetching] = useState(true);
    const crud_url = "agent/hafizbilgi-create/";

    const [validationErrors, setValidationErrors] = useState({});
    const onaydurumu_choise = ["Onaylandı", "Onaylanmadı"];
    const isMarried_choise = ["Evli", "Bekar"];
    const gender_choise = ["Erkek", "Kadın"];
    var meslek_choise = [];
    // var iller_choise = [];
    // var ilceler_choice = [];

    
    const FetchMesleks = () => {        
        useAxios()
            .get(`job/list/`)
            .then((res) => {
                
                if (meslek_choise.length != 0) {
                    for (var i = 0; i < meslek_choise.length; i++) {
                        meslek_choise.splice(i, 1);
                    }
                    console.log(meslek_choise);
                }
                res.data.forEach(function (meslek) {
                    meslek_choise.push(meslek.name);
                });
                setMeslekler(meslek_choise);
            });
    };
    const fetchIller = () => {
        
        useAxios().get(`city/list/`)
            .then((res) => {
                
                setIller(res.data);
                if (iller_choise.length != 0) {
                    for (var i = 0; i < iller_choise.length; i++) {
                        iller_choise.splice(i, 1);
                    }
                    console.log(iller_choise);
                }
                res.data.forEach(function (il) {
                    iller_choise.push(il.name);
                });
                setIllerChoise(iller_choise);
            });
    };
    const fetchIlceler = (name) => {
        useAxios().get(`district/list/`)
            .then((res) => {                
                if (ilceler_choice.length != 0) {
                    for (var i = 0; i < ilceler_choice.length; i++) {
                        ilceler_choice.splice(i, 1);
                    }
                    console.log(ilceler_choice);
                }
                res.data.forEach(function (ilce) {
                    if (ilce.city.name == name) {
                        ilceler_choice.push(ilce.name);
                    }
                });
                setIlcelerChoise(ilceler_choice);
            });
    };
    console.log(ilceler_choice);
    const fetchYillar = () => {
        var Yillar = []
        var nowYear = new Date().getFullYear();
        for (var i = 1930; i <= nowYear; i++) {
            Yillar.push(i);
        }
        setYillar(Yillar)
    };

    const fetchHafizBilgis = () => {
        setFetching(true);
        useAxios()
            .get(`agent/hafiz-list/${UserData()?.user_id}/`)
            .then((res) => {
                res.data.forEach((item) => {                  
                                     
                    // iller.forEach((il) => {
                        
                    //     if (il.id == item.adresIl) {
                            
                    //         item.adresIl = il.name;
                    //     }
                    //     if (il.id == item.hafizlikyaptigikursili) {
                            
                    //         item.hafizlikyaptigikursili = il.name;
                    //     }
                    // })
                    // ilceler.forEach((ilce) => {
                        
                    //     if (ilce.id == item.adresIlce) {
                            
                    //         item.adresIlce = ilce.name;
                    //     }
                    // })
                    console.log(item);
                })
                console.log(res.data);
                setHafizBilgis(res.data);
                setFetching(false);
            });
    };
    useEffect(() => { 
               
        FetchMesleks();
        fetchIller();
        fetchIlceler();
        fetchYillar();
        fetchHafizBilgis();
    }, []);
    // Column Headers
    const columns = useMemo(
        () => [
            {
                accessorKey: 'id',
                header: 'Id',
                enableEditing: false,
                size: 80,
                muiEditTextFieldProps: {
                    variant: 'outlined',

                },

            },
            {
                accessorKey: 'agent',
                header: 'Temsilci',
                enableEditing: false,
                size: 80,
                muiEditTextFieldProps: {
                    variant: 'outlined'
                },

            },
            {
                accessorKey: "full_name",
                header: "Adı Soyadı",
                muiEditTextFieldProps: {
                    variant: 'outlined',
                    required: true,
                    error: !!validationErrors?.full_name,
                    helperText: validationErrors?.full_name,
                    onFocus: () =>
                        setValidationErrors({
                            ...validationErrors,
                            full_name: undefined,
                        }),
                },

            },
            {
                accessorKey: "babaadi",
                header: "Baba Adı",
                muiEditTextFieldProps: {
                    variant: 'outlined',
                    hide: true,
                    required: true,
                    error: !!validationErrors?.babaadi,
                    helperText: validationErrors?.babaadi,
                    onFocus: () =>
                        setValidationErrors({
                            ...validationErrors,
                            babaadi: undefined,
                        }),
                },
            },
            {
                accessorKey: "tcno",
                header: "TC Kimlik NO",
                muiEditTextFieldProps: {
                    variant: 'outlined',
                    required: true,
                    error: !!validationErrors?.tcno,
                    helperText: validationErrors?.tcno,
                    onFocus: () =>
                        setValidationErrors({
                            ...validationErrors,
                            tcno: undefined,
                        }),
                },
            },
            {
                accessorKey: "adres",
                header: "Adres",
                muiEditTextFieldProps: {
                    variant: 'outlined',
                    required: true,
                    error: !!validationErrors?.adres,
                    helperText: validationErrors?.adres,
                    onFocus: () =>
                        setValidationErrors({
                            ...validationErrors,
                            adres: undefined,
                        }),
                },
            },
            {
                accessorKey: "adresIl",
                header: "Adres İl",
                editVariant: "select",
                editSelectOptions: iller_choise,                         
                muiEditTextFieldProps: { 
                    onChange: (event) => {
                        const value = event.target.value;
                        fetchIlceler(value);
                    },   
                    variant: 'outlined',
                    select: true,
                    error: !!validationErrors?.adresIl,
                    helperText: validationErrors?.adresIl,
                    onFocus: () => {
                        setValidationErrors({
                            ...validationErrors,
                            adresIl: undefined,
                        })
                    },
                  
                },
            },
            {
                accessorKey: "adresIlce",
                header: "Adres İlçe",
                editVariant: "select",
                editSelectOptions: ilceler_choice,
                
                muiEditTextFieldProps: {
                    onChange: (event) => {
                        const value = event.target.value;
                    },
                    variant: 'outlined',
                    editable: 'never',
                    select: true,
                    error: !!validationErrors?.adresIlce,
                    helperText: validationErrors?.adresIlce,
                    onFocus: () => {
                        setValidationErrors({
                            ...validationErrors,
                            adresIlce: undefined,
                        })
                    }
                },
            },
            {
                accessorKey: "hafizlikbitirmeyili",
                header: "Hafızlık Bitirme Yılı",
                editVariant: "select",
                editSelectOptions: yillar,
                muiEditTextFieldProps: {
                    variant: 'outlined',
                    select: true,
                    error: !!validationErrors?.hafizlikbitirmeyili,
                    helperText: validationErrors?.hafizlikbitirmeyili,
                    onFocus: () => {
                        FetchMesleks(),
                            setValidationErrors({
                                ...validationErrors,
                                hafizlikbitirmeyili: undefined,
                            })
                    }

                },
            },
            {
                accessorKey: "evtel",
                header: "Ev Telefonu",
                muiEditTextFieldProps: {
                    variant: 'outlined',
                    required: true,
                    error: !!validationErrors?.evtel,
                    helperText: validationErrors?.evtel,
                    onFocus: () =>
                        setValidationErrors({
                            ...validationErrors,
                            evtel: undefined,
                        }),
                },
            },
            {
                accessorKey: "istel",
                header: "İş Telefonu",
                muiEditTextFieldProps: {
                    variant: 'outlined',
                    required: true,
                    error: !!validationErrors?.istel,
                    helperText: validationErrors?.istel,
                    onFocus: () =>
                        setValidationErrors({
                            ...validationErrors,
                            istel: undefined,
                        }),
                },
            },
            {
                accessorKey: "ceptel",
                header: "Cep Telefonu",
                muiEditTextFieldProps: {
                    variant: 'outlined',
                    required: true,
                    error: !!validationErrors?.ceptel,
                    helperText: validationErrors?.ceptel,
                    onFocus: () =>
                        setValidationErrors({
                            ...validationErrors,
                            ceptel: undefined,
                        }),
                },
            },
            {
                accessorKey: "isMarried",
                header: "Evli/Bekar",
                editVariant: "select",
                editSelectOptions: isMarried_choise,
                muiEditTextFieldProps: {
                    variant: 'outlined',
                    select: true,
                    error: !!validationErrors?.isMarried,
                    helperText: validationErrors?.isMarried,
                 
                },
            },
            {
                accessorKey: "email",
                header: "E-Posta",
                muiEditTextFieldProps: {
                    variant: 'outlined',
                    required: true,
                    error: !!validationErrors?.email,
                    helperText: validationErrors?.email,
                    onFocus: () =>
                        setValidationErrors({
                            ...validationErrors,
                            email: undefined,
                        }),
                },
            },
            {
                accessorKey: "hafizlikyaptigikursadi",
                header: "Hafızlık Yaptığı Kurs Adı",
                muiEditTextFieldProps: {
                    variant: 'outlined',
                    required: true,
                    error: !!validationErrors?.hafizlikyaptigikursadi,
                    helperText: validationErrors?.hafizlikyaptigikursadi,
                    onFocus: () =>
                        setValidationErrors({
                            ...validationErrors,
                            hafizlikyaptigikursadi: undefined,
                        }),
                },
            },
            {
                accessorKey: "hafizlikyaptigikursili",
                header: "Hafızlık Yaptığı Kurs İli",
                editVariant: "select",
                editSelectOptions: iller_choise,                
                muiEditTextFieldProps: {
                    variant: 'outlined',
                    select: true,
                    error: !!validationErrors?.hafizlikyaptigikursili,
                    helperText: validationErrors?.hafizlikyaptigikursili,
                    onFocus: () => {
                        setValidationErrors({
                            ...validationErrors,
                            hafizlikyaptigikursili: undefined,
                        })
                    },
                   
                },
            },
            {
                accessorKey: "gorev",
                header: "Görevi",
                muiEditTextFieldProps: {
                    variant: 'outlined',
                    required: true,
                    error: !!validationErrors?.gorev,
                    helperText: validationErrors?.gorev,
                    onFocus: () =>
                        setValidationErrors({
                            ...validationErrors,
                            gorev: undefined,
                        }),
                },
            },
            {
                accessorKey: "hafizlikhocaadi",
                header: "Hafızlık Hocası Adı",
                muiEditTextFieldProps: {
                    variant: 'outlined',
                    required: true,
                    error: !!validationErrors?.hafizlikhocaadi,
                    helperText: validationErrors?.hafizlikhocaadi,
                    onFocus: () =>
                        setValidationErrors({
                            ...validationErrors,
                            hafizlikhocaadi: undefined,
                        })
                },
            },
            {
                accessorKey: "hafizlikhocasoyadi",
                header: "Hafızlık Hocası Soyadı",
                muiEditTextFieldProps: {
                    variant: 'outlined',
                    required: true,
                    error: !!validationErrors?.hafizlikhocasoyadi,
                    helperText: validationErrors?.hafizlikhocasoyadi,
                    onFocus: () =>
                        setValidationErrors({
                            ...validationErrors,
                            hafizlikhocasoyadi: undefined,
                        })
                },
            },
            {
                accessorKey: "hafizlikhocaceptel",
                header: "Hafızlık Hocası Cep Telefonu",
                muiEditTextFieldProps: {
                    variant: 'outlined',
                    required: true,
                    error: !!validationErrors?.hafizlikhocaceptel,
                    helperText: validationErrors?.hafizlikhocaceptel,
                    onFocus: () =>
                        setValidationErrors({
                            ...validationErrors,
                            hafizlikhocaceptel: undefined,
                        })
                },
            },
            {
                accessorKey: "hafizlikarkadasadi",
                header: "Hafızlık Arkadaş Adı",
                muiEditTextFieldProps: {
                    variant: 'outlined',
                    required: true,
                    error: !!validationErrors?.hafizlikarkadasadi,
                    helperText: validationErrors?.hafizlikarkadasadi,
                    onFocus: () =>
                        setValidationErrors({
                            ...validationErrors,
                            hafizlikarkadasadi: undefined,
                        })
                },
            },
            {
                accessorKey: "hafizlikarkadasoyad",
                header: "Hafızlık Hocası Soyadı",
                muiEditTextFieldProps: {
                    variant: 'outlined',
                    required: true,
                    error: !!validationErrors?.hafizlikarkadasoyad,
                    helperText: validationErrors?.hafizlikarkadasoyad,
                    onFocus: () =>
                        setValidationErrors({
                            ...validationErrors,
                            hafizlikarkadasoyad: undefined,
                        })
                },
            },
            {
                accessorKey: "hafizlikarkadasceptel",
                header: "Hafızlık Hocası Cep Telefonu",
                muiEditTextFieldProps: {
                    variant: 'outlined',
                    required: true,
                    error: !!validationErrors?.hafizlikarkadasceptel,
                    helperText: validationErrors?.hafizlikarkadasceptel,
                    onFocus: () =>
                        setValidationErrors({
                            ...validationErrors,
                            hafizlikarkadasceptel: undefined,
                        })
                },
            },

            {
                accessorKey: "referanstcno",
                header: "Referans TC Kimlik NO",
                muiEditTextFieldProps: {
                    variant: 'outlined',
                    required: true,
                    error: !!validationErrors?.referanstcno,
                    helperText: validationErrors?.referanstcno,
                    onFocus: () =>
                        setValidationErrors({
                            ...validationErrors,
                            referanstcno: undefined,
                        })
                },
            },
            {
                accessorKey: "yas",
                header: "Yaş",
                muiEditTextFieldProps: {
                    variant: 'outlined',
                    required: true,
                    error: !!validationErrors?.yas,
                    helperText: validationErrors?.yas,
                    onFocus: () =>
                        setValidationErrors({
                            ...validationErrors,
                            yas: undefined,
                        }),
                },
            },
            {
                accessorKey: "job",
                header: "Meslek",
                editVariant: "select",
                editSelectOptions: meslekler,
                muiEditTextFieldProps: {
                    variant: 'outlined',
                    select: true,
                    error: !!validationErrors?.job,
                    helperText: validationErrors?.job,
                    onFocus: () => {
                        FetchMesleks(),
                        setValidationErrors({
                            ...validationErrors,
                            job: undefined,
                        })
                    }
                },
            },
            {
                accessorKey: "description",
                header: "Hakkında",
                muiEditTextFieldProps: {
                    variant: 'outlined',
                    required: true,
                    error: !!validationErrors?.description,
                    helperText: validationErrors?.description,
                    onFocus: () =>
                        setValidationErrors({
                            ...validationErrors,
                            description: undefined,
                        }),
                },
            },
            {
                accessorKey: "onaydurumu",
                header: "Onay Durumu",
                editVariant: "select",
                editSelectOptions: onaydurumu_choise,
                muiEditTextFieldProps: {
                    variant: 'outlined',
                    select: true,
                    error: !!validationErrors?.onaydurumu,
                    helperText: validationErrors?.onaydurumu,
                },
            },
            {
                accessorKey: "gender",
                header: "Cinsiyet",
                editVariant: "select",
                editSelectOptions: gender_choise,
                muiEditTextFieldProps: {
                    variant: 'outlined',
                    select: true,
                    error: !!validationErrors?.gender,
                    helperText: validationErrors?.gender,
                },
            }
        ],
        [validationErrors]
    );

    // Field Validators

    const validateLength = (value, field, lowest) => {
        if (value == null || value.length === 0) {
            return `Boş Olamaz`;
        } else if (value.length < lowest) {
            return `En az ${lowest} Karakter Gerekli`;
        } else {
            return "";
        }
    };

    const validateSelect = (value, options) => {
        return options.includes(value);
    };

    const validateMinNumber = (value, minimum) => {
        return value > minimum;
    };

    function validateData(data) {
        return {
            full_name: validateLength(data.full_name, "full_name", 3),
            description: validateLength(data.description, "description", 20),
            onaydurumu: !validateSelect(data.onaydurumu, onaydurumu_choise)
                ? "Onay Durumu Seçiniz"
                : "",
            // job: !validateSelect(data.job, meslekler)
            //     ? "Meslek Seçiniz"
            //     : "",
            yas: !validateMinNumber(data.yas, 0)
                ? "Yaş 0 dan büyük olmalı"
                : ""

        };
    }

    return (
        <>
            <BaseHeader />

            <section className="pt-3 pb-3">
                <div className="container">
                    {/* Header Here */}
                    <Header />
                    <div className="row mt-0 mt-md-4">
                        {/* Sidebar Here */}
                        <Sidebar />
                        <div className="col-lg-10 col-md-12 col-12">
                            <h4 className="mb-0 mb-4">
                                {" "}
                                <i className="fas fa-chalkboard-user"></i> Hafız Bilgileri
                            </h4>

                            {fetching === true && <p className="mt-3 p-3">Yükleniyor...</p>}

                            {fetching === false && (
                                <div className="card mb-4">
                                    {fetching ? (
                                        <Spinner />
                                    ) : hafizBilgi.length === 0 ? (
                                        <p>Hafız Bilgi Bulunamadı</p>
                                    ) : (
                                        <CrudTable
                                            data={hafizBilgi}
                                            fetchData={fetchHafizBilgis}
                                            setValidationErrors={setValidationErrors}
                                            columns={columns}
                                            crud_url={crud_url}
                                            validateData={validateData}
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <BaseFooter />
        </>
    );
}

export default HafizBilgiList;
