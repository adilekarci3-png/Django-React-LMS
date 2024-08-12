import { useState, useEffect, useMemo } from "react";
import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";

import useAxios from "../../utils/useAxios";
import Spinner from "../Spinner/Spinner";
import CrudTable from "../CrudTable/CrudTable";

function HafizBilgiList() {
    const [hafizBilgi, setHafizBilgis] = useState([]);
    const [meslekler, setMeslekler] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const crud_url = "http://localhost:8000/api/products/";

    const [validationErrors, setValidationErrors] = useState({});
    const onaydurumu_choise = ["Onaylandı", "Onaylanmadı"];
    const meslek_choise = [];
    

    const fetchHafizBilgis = () => {
        setIsLoading(true);
        useAxios()
            .get(`hafizbilgi/list/`)
            .then((res) => {                
                console.log(res.data);
                setHafizBilgis(res.data);  
                setIsLoading(false);
            });
    };
    const FetchMesleks = () => {
        setIsLoading(true);
        useAxios()
            .get(`job/list/`)
            .then((res) => {              
                console.log(res.data);
                setMeslekler(res.data);
                res.data.forEach(function(meslek){ 
                    debugger;
                    meslek_choise.push(meslek.name);
                });
                setIsLoading(false);
            });
    };
    useEffect(() => {
        fetchHafizBilgis();
        FetchMesleks();
    }, []);
    // Column Headers
    const columns = useMemo(
        () => [           
            {
                accessorKey: "name",
                header: "Adı",                
                muiEditTextFieldProps: {
                    required: true,
                    error: !!validationErrors?.name,
                    helperText: validationErrors?.name,                    
                    onFocus: () =>
                        setValidationErrors({
                            ...validationErrors,
                            name: undefined,
                        }),
                },
            },
            {
                accessorKey: "surname",
                header: "Soyadı",
                muiEditTextFieldProps: {
                    required: true,
                    error: !!validationErrors?.surname,
                    helperText: validationErrors?.surname,
                    onFocus: () =>
                        setValidationErrors({
                            ...validationErrors,
                            surname: undefined,
                        }),
                },
            },
            {
                accessorKey: "babaadi",
                header: "Baba Adı",
                muiEditTextFieldProps: {
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
                accessorKey: "decription",
                header: "Hakkında",
                muiEditTextFieldProps: {
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
                editSelectOptions: meslek_choise,
                muiEditTextFieldProps: {
                    select: true,
                    error: !!validationErrors?.job,
                    helperText: validationErrors?.job,
                },
            },
            {
                accessorKey: "onaydurumu",
                header: "Onay Durumu",
                editVariant: "select",
                editSelectOptions: onaydurumu_choise,
                muiEditTextFieldProps: {
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
        debugger;
        if (value.length === 0 && value == null) {
            return `${field} Boş Olamaz`;
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
            name: validateLength(data.name, "Name", 3),
            decription: validateLength(data.decription, "decription", 20),
            onaydurumu: !validateSelect(data.onaydurumu, onaydurumu_choise)
                ? "Onay Durumu Seçiniz"
                : "",
            yas: !validateMinNumber(data.yas, 0)
                ? "Yaş 0 dan büyük olmalı"
                : "",
            // quantity: !validateMinNumber(data.quantity, 0)
            //     ? "Quantity cannot be less than 0"
            //     : "",
        };
    }

    return (
        <>
            <BaseHeader />
            <section className="pt-5 pb-5">
                <div className="container">
                    <div className="HafizBilgiList">
                        {isLoading ? (
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
                </div>
            </section>
            <BaseFooter />
        </>
    );
}
export default HafizBilgiList;