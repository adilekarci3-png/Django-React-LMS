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
  Stack,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  TextField,
  Tooltip,
  Fab
} from "@mui/material";
import EditIcon from "@mui/icons-material/EditTwoTone";
import DeleteIcon from "@mui/icons-material/DeleteTwoTone";
import useAxios from "../../utils/useAxios";
import UserData from "../plugin/UserData";

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
    const response = await useAxios().post(crud_url, values);
    fetchData();
  };

  const updateData = async (values) => {
    debugger;
    console.log(UserData())
    try {
      await useAxios()
        .patch(`agent/hafizbilgi-update/'+${values.agent_id}/${values.id}/`, values)
        .then((res) => {
          debugger;
          console.log(res.data);
          // fetchReviewsData();
          Toast().fire({
            icon: "success",
            title: "Hafız Bilgileri Güncellendi",
          });
          // setReply("");
        });
    } catch (error) {
      console.log(error);
    }
  };

  const deleteData = async (id) => {
    //const response = await axios.delete(${crud_url}${id}/);
    fetchData();
  };

  //CREATE action
  const handleCreateData = async ({ values, table }) => {
    console.log(values);
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
    const newValidationErrors = validateData(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      debugger;
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    debugger;
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
    createDisplayMode: "modal", //default ('row', and 'custom' are also available)
    editDisplayMode: "modal", //default ('row', 'cell', 'table', and 'custom' are also available)    
    enableEditing: true,
    localization: MRT_Localization_TR,
    getRowId: (row) => row.id,
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
      <Box component="div" whiteSpace="nowrap"
      >
        <Typography variant="h6">Adı: {row.original.full_name}</Typography>
        <Typography variant="h6">Baba Adı: {row.original.babaadi}</Typography>
        <Typography variant="h6">TC Kimlik No: {row.original.tcno}</Typography>
        <Typography variant="h6">Adres: {row.original.adres}</Typography>
        <Typography variant="h6">İl: {row.original.adresIl}</Typography>
        <Typography variant="h6">İlçe: {row.original.adresIlce}</Typography>
        <Typography variant="h6">Hafızlık Bitirme Yılı: {row.original.hafizlikbitirmeyili}</Typography>
        <Typography variant="h6">Ev Telefonu: {row.original.evtel}</Typography>
        <Typography variant="h6">İş Telefonu: {row.original.istel}</Typography>
        <Typography variant="h6">Cep Telefonu: {row.original.ceptel}</Typography>
        <Typography variant="h6">Evli/Bekar: {row.original.isMarried}</Typography>
        <Typography variant="h6">E-Posta: {row.original.ePosta}</Typography>
        <Typography variant="h6">Hafızlık Yaptığı Kurs Adı: {row.original.hafizlikyaptigikursadi}</Typography>
        <Typography variant="h6">Hafızlık Yaptığı Kurs Ili: {row.original.hafizlikyaptigikursili}</Typography>
        <Typography variant="h6">Görevi: {row.original.gorev}</Typography>
        <Typography variant="h6">Hafız Hoca Adı: {row.original.hafizlikhocaadi}</Typography>
        <Typography variant="h6">Hafız Hoca Soyadı: {row.original.hafizlikhocasoyadi}</Typography>
        <Typography variant="h6">Hafız Hoca Cep Telefonu: {row.original.hafizlikhocaceptel}</Typography>
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
    renderCreateRowDialogContent: ({ table, row }) => (
      <>
        <DialogTitle variant="h6" fontFamily="sans serif" textAlign='center'>Yeni Hafız Bilgisi Ekle</DialogTitle>
        <DialogContent
          sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >
          <form onSubmit={(e) => e.preventDefault()}>
            <Stack
              sx={{
                width: '100%',
                minWidth: { xs: '300px', sm: '360px', md: '400px' },
                gap: '1.5rem',
              }}
            >
              {columns.filter(column =>
                column.accessorKey === 'full_name' ||
                column.accessorKey === 'babaadi' ||
                column.accessorKey === 'tcno' ||
                column.accessorKey === 'description' ||
                column.accessorKey === 'description' ||
                column.accessorKey === 'description' ||
                column.accessorKey === 'description' ||
                column.accessorKey === 'description' ||
                column.accessorKey === 'description' ||
                column.accessorKey === 'description' ||
                column.accessorKey === 'description' ||
                column.accessorKey === 'babaadi').map((column) => (
                  <TextField
                    key={column.accessorKey}
                    variant='outlined'
                    id="standard-basic"
                    label={column.header}
                    name={column.accessorKey}
                    type={column.accessorKey === 'item' ? 'text' : 'number'}
                    onChange={(e) =>
                      setValues({ ...values, [e.target.name]: e.target.value })
                    }
                  />
                ))}
            </Stack>
          </form>
        </DialogContent>
        <DialogActions sx={{ p: '1.25rem' }}>
          <MRT_EditActionButtons variant="text" table={table} row={row} />
        </DialogActions>

      </>

    ),
    renderEditRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <Dialog
          // onClose={handleCloseModal}
          aria-labelledby="customized-dialog-title"
          open={open}
          sx={{
            "& .MuiDialog-container": {
              "& .MuiPaper-root": {
                width: "750px",
                height:"1000px",
                maxWidth: "5000px",  // Set your width here                
                
              },
            },
          }}
        >
        <DialogTitle variant="h5">Düzenle</DialogTitle>
        <DialogContent
          // sx={{ display: 'column',mr: 1 , columnCount: 2, columnFill: 'balance', gap: '1.5rem', marginBottom:'2' }}
          sx={{ display: 'flex', flexDirection: 'column', gap: '1rem', flexWrap:'wrap', columnCount:3}}
        >
          {internalEditComponents} {/* or render custom edit components here */}
        </DialogContent>
        <DialogActions>
          <MRT_EditActionButtons variant="text" table={table} row={row} />
        </DialogActions>
        </Dialog>
      </>
    ),
    renderRowActions: ({ row, table }) => (
      <Box sx={{ display: "flex", gap: "1rem" }}>
        <Fab size="small" color="secondary" aria-label="add">
          <DeleteIcon style={{ fontSize: 20 }} onClick={() => openDeleteConfirmModal(row)} />
        </Fab>
        <Fab size="small" color="success" aria-label="edit">
          <EditIcon style={{ fontSize: 20 }} onClick={() => table.setEditingRow(row)} />
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
