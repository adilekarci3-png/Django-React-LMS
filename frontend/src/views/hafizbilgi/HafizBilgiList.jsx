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
  const crud_url = "hafizbilgi/list/";

  const [validationErrors, setValidationErrors] = useState({});
  const onaydurumu_choise = ["Onaylandı", "Onaylanmadı"];
  var meslek_choise = [];

  const fetchHafizBilgis = () => {
    setIsLoading(true);
    useAxios()
      .get(`hafizbilgi/list/`)
      .then((res) => {
        setHafizBilgis(res.data);
        setIsLoading(false);
      });
  };

  const FetchMesleks = () => {
    setIsLoading(true);
    useAxios()
      .get(`job/list/`)
      .then((res) => {
        setMeslekler(res.data);
        res.data.forEach(function (meslek) {
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
        accessorKey: "full_name",
        header: "Adı",
        muiEditTextFieldProps: {
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
        accessorKey: "adres",
        header: "Adres",
        muiEditTextFieldProps: {
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

  return (
    <>
      <BaseHeader />
      <section className="py-10 bg-gray-100 min-h-screen">
        <div className="container mx-auto">
          <h3 className="text-3xl font-semibold text-center mb-6 text-gray-800">
            Hafız Bilgi Listesi
          </h3>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            {isLoading ? (
              <div className="flex justify-center items-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500"></div>
              </div>
            ) : hafizBilgi.length === 0 ? (
              <p className="text-center text-gray-600">
                Hafız Bilgi Bulunamadı
              </p>
            ) : (
              <CrudTable
                data={hafizBilgi}
                fetchData={fetchHafizBilgis}
                setValidationErrors={setValidationErrors}
                columns={columns}
                crud_url={crud_url}
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
