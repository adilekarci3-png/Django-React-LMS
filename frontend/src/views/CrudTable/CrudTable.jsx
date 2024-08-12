import React, { useState } from "react";
import {
  MRT_EditActionButtons,
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { MRT_Localization_TR } from 'material-react-table/locales/tr';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/EditTwoTone";
import DeleteIcon from "@mui/icons-material/DeleteTwoTone";
import axios from "axios";


const CrudTable = ({
  data,
  fetchData,
  setValidationErrors,
  columns,
  crud_url,
  validateData,
}) => {
  const [isLoadingDataError, setIsLoadingDataError] = useState(false);
  // CUD Actions
  const createData = async (values) => {
    const response = await axios.post(crud_url, values);
    fetchData();
  };

  const updateData = async (values) => {
    //const response = await axios.put(${crud_url}${values.id}/, values);
    fetchData();
  };

  const deleteData = async (id) => {
    //const response = await axios.delete(${crud_url}${id}/);
    fetchData();
  };

  //CREATE action
  const handleCreateData = async ({ values, table }) => {
    // console.log(values);
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
    // console.log(values);
    const newValidationErrors = validateData(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    // await
    updateData(values);
    console.log(values);
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
    muiTableContainerProps: {
      sx: {
        maxHeight: '500px',
      },
    },
    muiExpandButtonProps: ({ row, table }) => ({
      onClick: () => table.setExpanded({ [row.id]: !row.getIsExpanded() }), //only 1 detail panel open at a time
      sx: {
        transform: row.getIsExpanded() ? 'rotate(180deg)' : 'rotate(-90deg)',
        transition: 'transform 0.2s',
      },
    }),
    renderDetailPanel: ({ row }) => (
      <Box
        sx={{
          display: 'grid',
          margin: 'auto',
          gridTemplateColumns: '2fr 1fr',
          width: '100%'          
        }}
      >
        <Typography>Adı: {row.original.name}</Typography>
        <Typography>Soyadı: {row.original.surname}</Typography>
        <Typography>Baba Adı: {row.original.babaadi}</Typography>
        <Typography>TC Kimlik No: {row.original.tcno}</Typography>
        <Typography>Adres: {row.original.adres}</Typography>
        <Typography>İl: {row.original.adresIl}</Typography>
        <Typography>İlçe: {row.original.adresIlce}</Typography>
        <Typography>Hafızlık Bitirme Yılı: {row.original.hafizlikbitirmeyili}</Typography>
        <Typography>Ev Telefonu: {row.original.evtel}</Typography>
        <Typography>İş Telefonu: {row.original.istel}</Typography>
        <Typography>Cep Telefonu: {row.original.ceptel}</Typography>
        <Typography>Evli/Bekar: {row.original.isMarried}</Typography>
        <Typography>E-Posta: {row.original.ePosta}</Typography>
        <Typography>Hafızlık Yaptığı Kurs Adı: {row.original.hafizlikyaptigikursadi}</Typography>
        <Typography>Hafızlık Yaptığı Kurs Ili: {row.original.hafizlikyaptigikursili}</Typography>
        <Typography>Görevi: {row.original.gorev}</Typography>
        <Typography>Hafız Hoca Adı: {row.original.hafizlikhocaadi}</Typography>
        <Typography>Hafız Hoca Soyadı: {row.original.hafizlikhocasoyadi}</Typography>
        <Typography>Hafız Hoca Cep Telefonu: {row.original.hafizlikhocaceptel}</Typography>
      </Box>
    ),
    //createDisplayMode: "modal", //default ('row', and 'custom' are also available)
    editDisplayMode: "modal", //default ('row', 'cell', 'table', and 'custom' are also available)    
    enableEditing: true,
    localization: MRT_Localization_TR,
    getRowId: (row) => row.id,
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
      <Dialog open={true}
        onClose={false} sx={{ '& .MuiDialog-paper': { width: '100%', maxHeight: 1000 } }}
        maxWidth="md"
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description">
        <>
          <DialogTitle variant="h5">Hafız Bilgi Ekle</DialogTitle>
          <DialogContent
            sx={{
              display: 'grid',
              columnGap: 10,
              rowGap: 3,
              gridTemplateColumns: 'repeat(2, 1fr)'
            }}
          >
            {internalEditComponents} {/* or render custom edit components here */}
          </DialogContent>
          <DialogActions>
            <MRT_EditActionButtons variant="text" table={table} row={row} />
          </DialogActions>
        </>
      </Dialog>

    ),
    renderEditRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle variant="h5">Düzenle</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          {internalEditComponents} {/* or render custom edit components here */}
        </DialogContent>
        <DialogActions>
          <MRT_EditActionButtons variant="text" table={table} row={row} />
        </DialogActions>
      </>
    ),
    renderRowActions: ({ row, table }) => (
      <Box sx={{ display: "flex", gap: "1rem" }}>
        <Tooltip title="Düzenle">
          <IconButton onClick={() => table.setEditingRow(row)}>
            <EditIcon  style={{ color: 'green', fontSize:35 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Sil">
          <IconButton color="error" onClick={() => openDeleteConfirmModal(row)}>
            <DeleteIcon style={{ color: 'red', fontSize:35 }}/>
          </IconButton>
        </Tooltip>
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
