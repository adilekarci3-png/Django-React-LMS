import React, { useState, useEffect } from "react";
import {
  MRT_EditActionButtons,
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { MRT_Localization_TR } from 'material-react-table/locales/tr';
import {
  Box,
  Button,
  Stack,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Tooltip,
  Fab
} from "@mui/material";
import EditIcon from "@mui/icons-material/EditTwoTone";
import DeleteIcon from "@mui/icons-material/DeleteTwoTone";
import useAxios from "../../utils/useAxios";
import UserData from "../plugin/UserData";
import Toast from "../plugin/Toast";
import axios from "axios";
import Swal from "sweetalert2";

const CrudTable = ({
  data,
  fetchData,
  setValidationErrors,
  columns,
  crud_url,
  validateData,
}) => {
  const [isLoadingDataError, setIsLoadingDataError] = useState(false);
  const [iller, setIller] = useState([]);
  const [ilceler, setIlceler] = useState([]);
  const [meslekler, setMeslekler] = useState([]);

  // CUD Actions
  const createData = async (values) => {
    try {
      
      const formdata = new FormData();
      formdata.append("full_name", values.full_name);
      formdata.append("adresIl", values.adresIl);
      formdata.append("adresIlce", values.adresIlce);
      formdata.append("hafizlikbitirmeyili", values.hafizlikbitirmeyili);
      formdata.append("ceptel", values.ceptel);
      formdata.append("email", values.email);
      formdata.append("hafizlikyaptigikursili", values.hafizlikyaptigikursili);
      formdata.append("hafizlikyaptigikursadi", values.hafizlikyaptigikursadi);
      formdata.append("gender", values.gender);
      formdata.append("job", values.job);
      formdata.append("babaadi", values.babaadi);
      formdata.append("tcno", values.tcno);
      formdata.append("adres", values.adres);
      formdata.append("evtel", values.evtel);
      formdata.append("istel", values.istel);
      formdata.append("isMarried", values.isMarried);
      formdata.append("gorev", values.gorev);
      formdata.append("hafizlikhocaadi", values.hafizlikhocaadi);
      formdata.append("hafizlikhocasoyadi", values.hafizlikhocasoyadi);
      formdata.append("hafizlikhocaceptel", values.hafizlikhocaceptel);
      formdata.append("hafizlikarkadasadi", values.hafizlikarkadasadi);
      formdata.append("hafizlikarkadasoyad", values.hafizlikarkadasoyad);
      formdata.append("hafizlikarkadasceptel", values.hafizlikarkadasceptel);
      formdata.append("referanstcno", values.referanstcno);
      formdata.append("onaydurumu", values.onaydurumu);
      formdata.append("description", values.description);
      formdata.append("active", true);
      formdata.append("agent", values.agent);
      formdata.append("country", 1);
      // console.log(hafizBilgi.category);
      // if (hafizBilgi.file !== null || hafizBilgi.file !== "") {
      //   formdata.append("file", hafizBilgi.file || "");
      // }
      
      const response = await axios.post(`http://127.0.0.1:8000/api/v1/hafizbilgi/create/`, formdata);
      console.log(response.data);
      Swal.fire({
        icon: "success",
        title: "Bilgileriniz Başarılı Bir Şekilde Kaydedildi"
      })
    }
    catch(e) {
      console.log(e);
      Swal.fire({
        icon: "error",
        title: "Girdiğiniz cep telefonu yada E-posta adresi ile daha önce kayıt yapılmıştır"
      })
    }
  };
  const updateData = async (values) => {
    try {
      await useAxios()
        .patch(`agent/hafizbilgi-update/${values.agent}/${values.id}/`, values)
        .then((res) => {
          Toast().fire({
            icon: "success",
            title: "Hafız Bilgileri Güncellendi",
          });
          fetchData();
          //renderDetailPanel();
          // setReply("");
        });
    } catch (error) {
      console.log(error);
    }
  };

  const FetchMesleks = () => {
    useAxios()
      .get(`job/list/`)
      .then((res) => {
        setMeslekler(res.data);
      });
  };
  const fetchIller = () => {
    useAxios().get(`city/list/`)
      .then((res) => {
        setIller(res.data);
      });
  };
  const fetchIlceler = (name) => {
    useAxios().get(`district/list/`)
      .then((res) => {
        setIlceler(res.data);
      });
  };
  useEffect(() => {
    FetchMesleks();
    fetchIller();
    fetchIlceler();
  }, []);



  const deleteData = async (id) => {
    //const response = await axios.delete(${crud_url}${id}/);
    fetchData();
  };

  //CREATE action
  const handleCreateData = async ({ values, table }) => {
    
    values.agent = UserData()?.user_id;
    iller.forEach(async (il) => {
      if (values.adresIl == il.name) {
        values.adresIl = il.id;
      }
      if (values.hafizlikyaptigikursili == il.name) {
        values.hafizlikyaptigikursili = il.id;
      }
    });

    ilceler.forEach(async (ilce) => {
      if (values.adresIlce == ilce.name) {
        values.adresIlce = ilce.id;
      }
    });

    meslekler.forEach(async (meslek) => {
      if (values.job == meslek.name) {
        values.job = meslek.id;
      }
    });

    const newValidationErrors = validateData(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    createData(values);
    // console.log(values);
    table.setCreatingRow(null); //exit creating mode
  };

  //UPDATE action
  const handleSaveData = async ({ values, table }) => {
    
    
    iller.forEach(async (il) => {
      if (values.adresIl == il.name) {
        values.adresIl = il.id;
      }
      if (values.hafizlikyaptigikursili == il.name) {
        values.hafizlikyaptigikursili = il.id;
      }
    });

    ilceler.forEach(async (ilce) => {
      if (values.adresIlce == ilce.name) {
        values.adresIlce = ilce.id;
      }
    });

    meslekler.forEach(async (meslek) => {
      if (values.job == meslek.name) {
        values.job = meslek.id;
      }
    });
    console.log(values);
    const newValidationErrors = validateData(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    updateData(values);    
    table.setEditingRow(null); //exit editing mode
    
  };

  //DELETE action
  const openDeleteConfirmModal = (row) => {
    // console.log(row.original.id);
    if (window.confirm("Silmek İstediğinizden Emin misiniz?")) {
      deleteData(row.original.id);
      console.log("Hafız Bilgisi Silindi");
    }
  };

  const table = useMaterialReactTable({
    columns,
    data: data,
    exportButton: true,
    enableExpandAll: false, //disable expand all button
    createDisplayMode: "modal", //default ('row', and 'custom' are also available)
    editDisplayMode: "modal", //default ('row', 'cell', 'table', and 'custom' are also available)    
    enableEditing: true,
    localization: MRT_Localization_TR,    
    muiTableBodyCellEditTextFieldProps:{ variant: 'standard' },  
    initialState: {
      density: 'compact',      
      columnVisibility: {
        id: false, agent: false, babaadi: false, isMarried: false,
        hafizlikyaptigikursadi: false, hafizlikyaptigikursili: false, gorev: false, hafizlikhocaadi: false,
        hafizlikhocasoyadi: false, hafizlikhocaceptel: false, hafizlikarkadasadi: false, hafizlikarkadasoyad: false,
        hafizlikarkadasceptel: false, referanstcno: false, descriptin: false, active: false
      }
    },
    getRowId: (row) => row.id,
    // muiTableContainerProps: {
    //   sx: {
    //     maxHeight: '500px',
    //   },
    // },
    muiExpandButtonProps: ({ row, table }) => ({
      onClick: () => table.setExpanded({ [row.id]: !row.getIsExpanded() }), //only 1 detail panel open at a time
      sx: {
        transform: row.getIsExpanded() ? 'rotate(180deg)' : 'rotate(-90deg)',
        transition: 'transform 0.2s',
      },
    }),
    renderDetailPanel: ({ row }) => (
      <Box component="div" whiteSpace="nowrap"
      >
        <Typography variant="body1">Adı: {row.original.full_name}</Typography>
        <Typography variant="body1">Baba Adı: {row.original.babaadi}</Typography>
        <Typography variant="body1">TC Kimlik No: {row.original.tcno}</Typography>
        <Typography variant="body1">Adres: {row.original.adres}</Typography>
        <Typography variant="body1">İl: {row.original.adresIl}</Typography>
        <Typography variant="body1">İlçe: {row.original.adresIlce}</Typography>
        <Typography variant="body1">Hafızlık Bitirme Yılı: {row.original.hafizlikbitirmeyili}</Typography>
        <Typography variant="body1">Ev Telefonu: {row.original.evtel}</Typography>
        <Typography variant="body1">İş Telefonu: {row.original.istel}</Typography>
        <Typography variant="body1">Cep Telefonu: {row.original.ceptel}</Typography>
        <Typography variant="body1">Evli/Bekar: {row.original.isMarried}</Typography>
        <Typography variant="body1">E-Posta: {row.original.ePosta}</Typography>
        <Typography variant="body1">Hafızlık Yaptığı Kurs Adı: {row.original.hafizlikyaptigikursadi}</Typography>
        <Typography variant="body1">Hafızlık Yaptığı Kurs Ili: {row.original.hafizlikyaptigikursili}</Typography>
        <Typography variant="body1">Görevi: {row.original.gorev}</Typography>
        <Typography variant="body1">Hafız Hoca Adı: {row.original.hafizlikhocaadi}</Typography>
        <Typography variant="body1">Hafız Hoca Soyadı: {row.original.hafizlikhocasoyadi}</Typography>
        <Typography variant="body1">Hafız Hoca Cep Telefonu: {row.original.hafizlikhocaceptel}</Typography>
      </Box>
    ),

    muiToolbarAlertBannerProps: isLoadingDataError
      ? {
        color: "error",
        children: "Veri Yükleme Hatası",
      }
      : undefined,
    muiTableContainerProps: {
      sx: {
        minHeight: "500px",
      },
    },

    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateData,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveData,
    renderCreateRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <Dialog
          // onClose={handleCloseModal}
          aria-labelledby="customized-dialog-title"
          open={open} 
          sx={{
            "& .MuiDialog-container": {
              "& .MuiPaper-root": {
                width: "750px",
                maxWidth: "5000px",  // Set your width here    
              },
            },
          }}
        >
          <DialogTitle variant="h6">Yeni Hafız Bilgi Ekle</DialogTitle>
          <DialogContent
            sx={{margin:2,rowGap:'10rem', display: 'div',columnCount:2,justifyItems:'legacy', alignItems:"initial", borderRadius:'7px' }}
          >
            {internalEditComponents}  {/* or render custom edit components here */}
          </DialogContent>
          <DialogActions>
            <MRT_EditActionButtons variant="text" table={table} row={row} />
          </DialogActions>
        </Dialog>
      </>

    ),
    renderEditRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
      {table.newValidationErrors !=null ? <span> error msg: newValidationErrors</span> : null}
      
        <Dialog
          // onClose={handleCloseModal}
          aria-labelledby="customized-dialog-title"
          open={open}
          sx={{
            "& .MuiDialog-container": {
              "& .MuiPaper-root": {
                width: "500px",
                maxWidth: "5000px",  // Set your width here    
              },
            },
          }}
        >
          <DialogTitle variant="h5">Düzenle</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignContent: 'baseline' }}>
            
            {internalEditComponents} {/* or render custom edit components here */}
            
          </DialogContent>
          <DialogActions>
            <MRT_EditActionButtons variant="text" table={table} row={row} />
          </DialogActions>
        </Dialog>
      </>
    ),
    renderRowActions: ({ row, table }) => (
      <Box sx={{ display: "flex", gap: "1.5rem", margin:1 }}>
        <Fab size="small" color="secondary" aria-label="add">
          <DeleteIcon style={{ fontSize: 20 }} onClick={() => openDeleteConfirmModal(row)} />
        </Fab>
        <Fab size="small" color="success" aria-label="edit">
          <EditIcon style={{ fontSize: 20,margin:2 }} onClick={() => table.setEditingRow(row)} />
        </Fab>
        {/* <Fab variant="extended">
        <NavigationIcon sx={{ mr: 1 }} />
        Navigate
      </Fab>
      <Fab disabled aria-label="like">
        <FavoriteIcon />
      </Fab> */}
        {/* <Tooltip title="Düzenle">
          <IconButton onClick={() => table.setEditingRow(row)}>
            <EditIcon  style={{ color: 'green', fontSize:35 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Sil">
          <IconButton color="error" onClick={() => openDeleteConfirmModal(row)}>
            <DeleteIcon style={{ color: 'red', fontSize:35 }}/>
          </IconButton>
        </Tooltip> */}
      </Box>
    ),
    renderTopToolbarCustomActions: ({ table }) => (
      <Button
        variant="contained"
        onClick={() => {
          table.setCreatingRow(true);
        }}
      >
        Yeni Hafız Bilgi
      </Button>
    ),
  });
  return <MaterialReactTable table={table} />
};

export default CrudTable;
