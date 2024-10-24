import { useEffect, useState } from "react";
import { Box, Modal, IconButton, Typography, Button, MenuItem, Select, InputLabel, FormControl } from "@mui/material";
import { useTheme } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { collection, getDocs } from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { db } from "../../Firebase"; // Update this import to match your actual Firebase config file
import Header from "../../components/Header";
import { tokens } from "../../theme";
import ImageIcon from '@mui/icons-material/Image'; // You can use any icon for the image
import CloseIcon from '@mui/icons-material/Close'; // Import the Close icon

// Airport data
const airports = [
  { code: 'MNL', name: 'Ninoy Aquino International Airport (MNL)' },
  { code: 'CEB', name: 'Mactan-Cebu International Airport (CEB)' },
  { code: 'DVO', name: 'Francisco Bangoy International Airport (DVO)' },
  { code: 'PQM', name: 'Panglao International Airport (PQM)' },
  { code: 'ILO', name: 'Iloilo International Airport (ILO)' },
  { code: 'ZAM', name: 'Zamboanga International Airport (ZAM)' },
  { code: 'TAC', name: 'Daniel Z. Romualdez Airport (TAC)' },
  { code: 'KLO', name: 'Kalibo International Airport (KLO)' },
  { code: 'BCA', name: 'Bacolet Airport (BCA)' },
  { code: 'BPI', name: 'Bohol–Panglao International Airport (BPI)' },
];

const Contacts = () => {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedAirport, setSelectedAirport] = useState(""); // State for selected airport
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const storage = getStorage();

  const columns = [
    { field: "id", headerName: "ID", flex: 1 },
    { field: "Time", headerName: "Time", flex: 1 },
    { field: "First Name", headerName: "First Name", flex: 1 },
    { field: "Last Name", headerName: "Last Name", flex: 1 },
    { field: "Nationality", headerName: "Country Code", flex: 1 },
    { field: "Gender", headerName: "Gender", flex: 1 },
    { field: "Document Number", headerName: "Passport ID", flex: 1 },
    { field: "Date of Birth", headerName: "Date of Birth", flex: 1 },

    {
      field: "image",
      headerName: "Image",
      flex: 1,
      renderCell: (params) => {
        const { id } = params.row;
        const handleClick = async () => {
          try {
            const imageUrl = await getDownloadURL(ref(storage, `Passport/${id}.jpg`)); // Adjust path as needed
            setSelectedImage(imageUrl);
            setOpen(true);
          } catch (error) {
            console.error("Error fetching image URL: ", error);
          }
        };
        return (
          <IconButton onClick={handleClick}>
            <ImageIcon />
          </IconButton>
        );
      },
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "ResultTable"));
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setData(data);
      } catch (error) {
        console.error("Error fetching Firestore data: ", error);
      }
    };

    fetchData();
  }, []);

  const handleAirportChange = (event) => {
    setSelectedAirport(event.target.value);
  };

  return (
    <Box m="20px">
      <Header
        title="Travelers Information"
        subtitle="List of Travelers Information"
      />

      {/* Dropdown for airports */}
      <FormControl fullWidth variant="outlined" margin="normal">
        <InputLabel id="airport-select-label">Select Airport</InputLabel>
        <Select
          labelId="airport-select-label"
          value={selectedAirport}
          onChange={handleAirportChange}
          label="Select Airport"
        >
          {airports.map((airport) => (
            <MenuItem key={airport.code} value={airport.code}>
              {airport.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .name-column--cell": {
            color: colors.greenAccent[300],
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${colors.grey[100]} !important`,
          },
        }}
      >
        <DataGrid
          rows={data}
          columns={columns}
          components={{ Toolbar: GridToolbar }}
          autoHeight
        />
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          aria-labelledby="image-modal-title"
          aria-describedby="image-modal-description"
        >
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '80%',
              bgcolor: 'background.paper',
              boxShadow: 24,
              p: 4,
              textAlign: 'center',
              position: 'relative', // Ensure this is positioned relative to contain the absolute positioning of the close button
            }}
          >
            <IconButton
              onClick={() => setOpen(false)}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                color: colors.grey[800], // Adjust color as needed
              }}
            >
              <CloseIcon />
            </IconButton>
            <Typography id="image-modal-title" variant="h6" component="h2">
              Image Preview
            </Typography>
            <img
              src={selectedImage}
              alt="Preview"
              style={{ maxWidth: '100%', maxHeight: '80vh' }}
            />
          </Box>
        </Modal>
      </Box>
    </Box>
  );
};

export default Contacts;
