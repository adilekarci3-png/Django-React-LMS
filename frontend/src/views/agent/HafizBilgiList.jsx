import { useState, useEffect, useMemo } from "react";
import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";

import UserData from "../plugin/UserData";
import useAxios from "../../utils/useAxios";

import Spinner from "../Spinner/Spinner";
import CrudTable from "../CrudTable/CrudTable";

function HafizBilgiList() {
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
    var meslek_choise = [];
    var iller_choise = [];
    var ilceler_choice =[];

    const fetchHafizBilgis = () => {
        setFetching(true);
        useAxios()
            .get(`agent/hafiz-list/${UserData()?.user_id}/`)
            .then((res) => {
                console.log(res.data);
                setHafizBilgis(res.data);
                setFetching(false);
            });
    };
    const FetchMesleks = () => {        
        useAxios()
            .get(`job/list/`)
            .then((res) => {
                setMeslekler(res.data);                
                if(meslek_choise.length!=0){
                    for (var i = 0; i < meslek_choise.length; i++) {
                        meslek_choise.splice(i, 1);
                    }    
                    console.log(meslek_choise);
                }               
                res.data.forEach(function (meslek) {
                    debugger;
                    meslek_choise.push(meslek.name);                    
                });                
                setMeslekler(meslek_choise); 
            });            
    };
    const fetchIller = () => {
        useAxios().get(`city/list/`)
          .then((res) => {
            setIller(res.data);             
            if(iller_choise.length!=0){
                for (var i = 0; i < iller_choise.length; i++) {
                    iller_choise.splice(i, 1);
                }    
                console.log(iller_choise);
            }               
            res.data.forEach(function (il) {
                debugger;
                iller_choise.push(il.name);                    
            });                
            setIller(iller_choise); 
          });
      };
    const fetchIlceler = (name) => {  
        debugger;  
        useAxios().get(`district/list/`)
          .then((res) => {              
            setIlceler(res.data);                                   
            if(ilceler_choice.length!=0){
                for (var i = 0; i < ilceler_choice.length; i++) {
                    ilceler_choice.splice(i, 1);
                }    
                console.log(ilceler_choice);
            }               
            res.data.forEach(function (ilce) {
                debugger;
                if(ilce.city.name==name){
                    ilceler_choice.push(ilce.name); 
                }                                  
            });                
            setIlceler(ilceler_choice); 
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
        fetchHafizBilgis();
        FetchMesleks();
        fetchIller();
        fetchIlceler();
        fetchYillar();
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
                    variant: 'outlined'                    
                },
              },
            {
                accessorKey: "full_name",
                header: "Adı",                
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
                editSelectOptions: iller,
                muiEditTextFieldProps: { 
                    onChange: (event) => {                        
                        const value = event.target.value;
                        fetchIlceler(value);                   
                    },  
                    variant: 'outlined',                 
                    select: true,
                    error: !!validationErrors?.adresIl,
                    helperText: validationErrors?.adresIl,
                    onFocus: () =>{                         
                        setValidationErrors({
                        ...validationErrors,
                        adresIl: undefined,
                            })                        
                        }                       
                },
            },
            {
                accessorKey: "adresIlce",
                header: "Adres İlçe",
                editVariant: "select",
                editSelectOptions: ilceler,
                muiEditTextFieldProps: { 
                    onChange: (event) => {
                        
                        const value = event.target.value;                        
                    },  
                    variant: 'outlined',                 
                    select: true,
                    error: !!validationErrors?.adresIlce,
                    helperText: validationErrors?.adresIlce,
                    onFocus: () =>{                         
                        setValidationErrors({
                        ...validationErrors,
                        adresIlce: undefined,
                            })                        
                        }                       
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
                accessorKey: "job",
                header: "Meslek",
                editVariant: "select",
                editSelectOptions: meslekler,
                muiEditTextFieldProps: {  
                    variant: 'outlined',                  
                    select: true,
                    error: !!validationErrors?.job,
                    helperText: validationErrors?.job,
                    onFocus: () =>{ 
                        FetchMesleks(),
                        setValidationErrors({
                        ...validationErrors,
                        job: undefined,
                            })                        
                        }
                       
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
            job: !validateSelect(data.job, meslek_choise)
                ? "Meslek Seçiniz"
                : "",
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
