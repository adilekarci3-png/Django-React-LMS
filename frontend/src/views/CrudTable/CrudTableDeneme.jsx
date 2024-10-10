import { useState, useEffect, useMemo } from "react";
import {
  MRT_EditActionButtons,
  MaterialReactTable,
  // createRow,
  useMaterialReactTable,
} from 'material-react-table';
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
} from '@mui/material';
// import {
//   QueryClient,
//   QueryClientProvider,
//   useMutation,
//   useQuery,
//   useQueryClient,
// } from '@tanstack/react-query';
// import { fakeData, usStates } from './makeData';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import useAxios from "../../utils/useAxios";
import UserData from "../plugin/UserData";

const Example = () => {
  const [validationErrors, setValidationErrors] = useState({});
  const [iller_choise, setIllerChoise] = useState([]);
  const [ilceler_choice, setIlcelerChoise] = useState([]);
  const [yillar, setYillar] = useState([]);
  const [hafizBilgi, setHafizBilgis] = useState([]);
  const [meslekler, setMeslekler] = useState([]);
  const [fetching, setFetching] = useState(true);
  const onaydurumu_choise = ["Onaylandı", "Onaylanmadı"];
  const isMarried_choise = ["Evli", "Bekar"];
  const gender_choise = ["Erkek", "Kadın"];
  var meslek_choise = [];


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
                }
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

//   //call CREATE hook
//   const { mutateAsync: createHafizBilgi, isPending: isCreatingHafizBilgi } =
//     useCreateHafizBilgi();
//   //call READ hook
//   const {
//     data: fetchedHafizBilgis = [],
//     isError: isLoadingHafizBilgisError,
//     isFetching: isFetchingHafizBilgis,
//     isLoading: isLoadingHafizBilgis,
//   } = useGetHafizBilgis();
//   //call UPDATE hook
//   const { mutateAsync: updateHafizBilgi, isPending: isUpdatingHafizBilgi } =
//     useupdateHafizBilgi();
//   //call DELETE hook
//   const { mutateAsync: deleteHafizBilgi, isPending: isDeletingHafizBilgi } =
//     useDeleteHafizBilgi();

  //CREATE action
  const handleCreateHafizBilgi = async ({ values, table }) => {
    const newValidationErrors = validateHafizBilgi(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    await createHafizBilgi(values);
    table.setCreatingRow(null); //exit creating mode
  };

  //UPDATE action
  const handleSaveHafizBilgi = async ({ values, table }) => {
    const newValidationErrors = validateHafizBilgi(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    await updateHafizBilgi(values);
    table.setEditingRow(null); //exit editing mode
  };

  //DELETE action
  const openDeleteConfirmModal = (row) => {
    if (window.confirm('Are you sure you want to delete this hafizbilgi?')) {
      deleteHafizBilgi(row.original.id);
    }
  };

  const table = useMaterialReactTable({
    columns,
    data: fetchHafizBilgis,
    createDisplayMode: 'modal', //default ('row', and 'custom' are also available)
    editDisplayMode: 'modal', //default ('row', 'cell', 'table', and 'custom' are also available)
    enableEditing: true,
    getRowId: (row) => row.id,
    // muiToolbarAlertBannerProps: isLoadingHafizBilgisError
    //   ? {
    //       color: 'error',
    //       children: 'Error loading data',
    //     }
    //   : undefined,
    muiTableContainerProps: {
      sx: {
        minHeight: '500px',
      },
    },
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateHafizBilgi,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveHafizBilgi,
    //optionally customize modal content
    renderCreateRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle variant="h3">Create New HafizBilgi</DialogTitle>
        <DialogContent
          sx={{ display: 'column', flexDirection: 'column', gap: '1rem', columnCount:2 }}
        >
          {internalEditComponents} {/* or render custom edit components here */}
        </DialogContent>
        <DialogActions>
          <MRT_EditActionButtons variant="text" table={table} row={row} />
        </DialogActions>
      </>
    ),
    //optionally customize modal content
    renderEditRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle variant="h3">Edit HafizBilgi</DialogTitle>
        <DialogContent
          sx={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        >
          {internalEditComponents} {/* or render custom edit components here */}
        </DialogContent>
        <DialogActions>
          <MRT_EditActionButtons variant="text" table={table} row={row} />
        </DialogActions>
      </>
    ),
    renderRowActions: ({ row, table }) => (
      <Box sx={{ display: 'flex', gap: '1rem' }}>
        <Tooltip title="Edit">
          <IconButton onClick={() => table.setEditingRow(row)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton color="error" onClick={() => openDeleteConfirmModal(row)}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    renderTopToolbarCustomActions: ({ table }) => (
      <Button
        variant="contained"
        onClick={() => {
          table.setCreatingRow(true); //simplest way to open the create row modal with no default values
          //or you can pass in a row object to set default values with the `createRow` helper function
          // table.setCreatingRow(
          //   createRow(table, {
          //     //optionally pass in default values for the new row, useful for nested data or other complex scenarios
          //   }),
          // );
        }}
      >
        Yeni Hafız Bilgi
      </Button>
    ),
    state: {
    //   isLoading: isLoadingHafizBilgis,
    //   isSaving: isCreatingHafizBilgi || isUpdatingHafizBilgi || isDeletingHafizBilgi,
    //   showAlertBanner: isLoadingHafizBilgisError,
    //   showProgressBars: isFetchingHafizBilgis,
    },
  });

  return <MaterialReactTable table={table} />;
};

//CREATE hook (post new hafizbilgi to api)
function useCreateHafizBilgi() {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async (hafizBilgi) => {
//       //send api update request here
//       await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
//       return Promise.resolve();
//     },
//     //client side optimistic update
//     onMutate: (newHafizBilgi) => {
//       queryClient.setQueryData(['hafizbilgis'], (prevnewHafizBilgis) => [
//         ...prevnewHafizBilgis,
//         {
//           ...newHafizBilgi,
//           id: (Math.random() + 1).toString(36).substring(7),
//         },
//       ]);
//     },
//     // onSettled: () => queryClient.invalidateQueries({ queryKey: ['HafizBilgis'] }), //refetch HafizBilgis after mutation, disabled for demo
//   });
}

//READ hook (get hafizbilgis from api)
function useGetHafizBilgis() {
//   return useQuery({
//     queryKey: ['hafizbilgis'],
//     queryFn: async () => {
//       //send api request here
//       await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
//       return Promise.resolve(fakeData);
//     },
//     refetchOnWindowFocus: false,
//   });
}

//UPDATE hook (put hafizbilgi in api)
function useupdateHafizBilgi() {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async (hafizbilgi) => {
//       //send api update request here
//       await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
//       return Promise.resolve();
//     },
//     //client side optimistic update
//     onMutate: (newHafizBilgi) => {
//       queryClient.setQueryData(['hafızbilgis'], (prevHafizBilgis) =>
//         prevHafizBilgis?.map((prevHafizBilgi) =>
//           prevHafizBilgi.id === newHafizBilgi.id ? newHafizBilgi : prevHafizBilgi,
//         ),
//       );
//     },
//     // onSettled: () => queryClient.invalidateQueries({ queryKey: ['HafizBilgis'] }), //refetch HafizBilgis after mutation, disabled for demo
//   });
}

//DELETE hook (delete HafizBilgi in api)
function useDeleteHafizBilgi() {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async (hafizbilgiId) => {
//       //send api update request here
//       await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
//       return Promise.resolve();
//     },
//     //client side optimistic update
//     onMutate: (hafizbilgiId) => {
//       queryClient.setQueryData(['hafizbilgis'], (prevHafizBilgis) =>
//         prevHafizBilgis?.filter((hafizbilgi) => hafizbilgi.id !== hafizbilgiId),
//       );
//     },
//     // onSettled: () => queryClient.invalidateQueries({ queryKey: ['hafizbilgis'] }), //refetch hafizbilgis after mutation, disabled for demo
//   });
}

// const queryClient = new QueryClient();

const ExampleWithProviders = () => (
  //Put this with your other react-query providers near root of your app
//   <QueryClientProvider client={queryClient}>
//     <Example />
//   </QueryClientProvider>
//     <QueryClientProvider>
    
//   </QueryClientProvider>
  <Example />
);

export default ExampleWithProviders;

const validateRequired = (value) => !!value.length;
const validateEmail = (email) =>
  !!email.length &&
  email
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    );

function validateHafizBilgi(hafizbilgi) {
  return {
    firstName: !validateRequired(hafizbilgi.firstName)
      ? 'First Name is Required'
      : '',
    lastName: !validateRequired(hafizbilgi.lastName) ? 'Last Name is Required' : '',
    email: !validateEmail(hafizbilgi.email) ? 'Incorrect Email Format' : '',
  };
}
