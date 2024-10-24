import { useEffect, useState } from "react";
import { Grid, Typography, Button,Box, IconButton, TextField, MenuItem, Dialog, DialogActions, DialogContent, DialogTitle, Menu } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { collection, onSnapshot } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { db } from "../../Firebase";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { CheckCircle } from '@mui/icons-material';
import {  Divider } from "@mui/material";
import { Luggage, FamilyRestroom, Flight, AttachMoney } from '@mui/icons-material';
import {  doc, updateDoc } from "firebase/firestore";
import airportList from '../airportlist';


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
  const [filteredData, setFilteredData] = useState([]);
  const [openConfirmation, setOpenConfirmation] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAirport, setSelectedAirport] = useState(""); // State for selected airport
  const [baggageInfo, setBaggageInfo] = useState(null); // State for selected baggage info
  const [openBaggageDialog, setOpenBaggageDialog] = useState(false); // State to open/close baggage dialog
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const storage = getStorage();

  const columns = createColumns(setBaggageInfo, setOpenBaggageDialog, setAnchorEl);

  const handleConfirmPassport = async () => {
    if (!baggageInfo) return;

    try {
      const docRef = doc(db, "BaggageInfo", baggageInfo.passportNumber + baggageInfo.dateOfArrival);

      await updateDoc(docRef, {
        passportScan: true,
      });

      console.log("updated");
      setAnchorEl(null);
      setOpenBaggageDialog(false);
    } catch (error) {
      console.error("Error updating passport scan:", error);
    }
  };

  const handleConfirmFaceRecognition = async () => {
    if (!baggageInfo) return;

    try {
      const docRef = doc(db, "BaggageInfo", baggageInfo.passportNumber + baggageInfo.dateOfArrival);

      await updateDoc(docRef, {
        faceRecognitionScan: true,
      });

      console.log("updated");
      setAnchorEl(null);
      setOpenBaggageDialog(false);
    } catch (error) {
      console.error("Error updating passport scan:", error);
    }
  };

  useEffect(() => {
    // Set up a real-time listener
    const unsubscribe = onSnapshot(
      collection(db, "BaggageInfo"),
      (querySnapshot) => {
        const fetchedData = querySnapshot.docs.map((doc) => ({
          id: doc.id, // Firestore's unique document ID
          ...doc.data(),
        }));

        // Filter data by selected airport if one is selected
        if (selectedAirport) {
          const filtered = fetchedData.filter((item) => item.airportArrival === selectedAirport);
          setFilteredData(filtered);
        } else {
          setFilteredData(fetchedData); // Show all data if no airport is selected
        }
        setData(fetchedData); // Store raw data
      },
      (error) => {
        console.error("Error fetching Firestore data: ", error);
      }
    );

    // Clean up the listener on unmount
    return () => unsubscribe();
  }, [selectedAirport]); // Depend on selectedAirport to re-filter data

  return (
    <Box m="20px">
      <Header title="Arriving Passengers" subtitle="List of Arriving Passengers" />

      <Box mb={2}>
        <TextField
          fullWidth
          select
          label="Select Airport"
          value={selectedAirport}
          onChange={(e) => setSelectedAirport(e.target.value)} // Set selected airport
        >
          {airportList.map((airport) => (
            <MenuItem key={airport.code} value={airport.code}>
              {airport.name}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <DataGridContainer filteredData={filteredData} colors={colors} columns={columns} />

      {/* Baggage Info Dialog */}
      <BaggageInfoDialog open={openBaggageDialog} onClose={() => setOpenBaggageDialog(false)} baggageInfo={baggageInfo} />

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={handleConfirmPassport}>Confirm Passport (Manual)</MenuItem>
        <MenuItem onClick={handleConfirmFaceRecognition}>Confirm Face Recognition (Manual)</MenuItem>
        <MenuItem
          onClick={() => {
            if (baggageInfo) {
              setOpenBaggageDialog(true);
              setAnchorEl(null);
            }
          }}
        >
          View Baggage Declaration
        </MenuItem>
      </Menu>
    </Box>
  );
};


// Create columns for the DataGrid
// Create columns for the DataGrid
const createColumns = (setBaggageInfo, setOpenBaggageDialog, setAnchorEl) => [
  { field: "passportNumber", headerName: "Passport Number", flex: 1 },
  { field: "firstName", headerName: "First Name", flex: 1 },
  { field: "middleName", headerName: "Middle Name", flex: 1 },
  { field: "surName", headerName: "Last Name", flex: 1 },
  { field: "gender", headerName: "Gender", flex: 1 },
  { field: "dateOfBirth", headerName: "Date of Birth", flex: 1 },
  { field: "nationality", headerName: "Nationality", flex: 1 },
  { field: "placeIssued", headerName: "Place Issued", flex: 1 },
  { field: "occupation", headerName: "Occupation", flex: 1 },
  {
    field: "dateOfArrival",
    headerName: "Date of Arrival",
    flex: 1,
    type: 'date',
    valueGetter: (params) => new Date(params.row.dateOfArrival),
  },
  { 
    field: "passport", 
    headerName: "Passport", 
    flex: 1, 
    renderCell: (params) => (
      params.row.passportScan ? <CheckCircle color="success" /> : null
    )
  },
  { 
    field: "Face Recognition", 
    headerName: "Face Recognition", 
    flex: 1, 
    renderCell: (params) => (
      params.row.faceRecognitionScan ? <CheckCircle color="success" /> : null
    )
  },
  {
    field: "actions",
    headerName: "",
    flex: 1,
    renderCell: (params) => (
      <IconButton onClick={(event) => {
        setBaggageInfo(params.row); // Store baggage info

        setAnchorEl(event.currentTarget); // Set the anchor for the menu
      }}>
        <MoreVertIcon />
      </IconButton>
    )
  }
];


// DataGrid container component
const DataGridContainer = ({ filteredData, colors, columns }) => (
  <Box m="40px 0 0 0" height="75vh" sx={{
    "& .MuiDataGrid-root": { border: "none" },
    "& .MuiDataGrid-cell": { borderBottom: "none" },
    "& .MuiDataGrid-columnHeaders": { backgroundColor: colors.blueAccent[700], borderBottom: "none" },
    "& .MuiDataGrid-virtualScroller": { backgroundColor: colors.primary[400] },
    "& .MuiDataGrid-footerContainer": { borderTop: "none", backgroundColor: colors.blueAccent[700] },
  }}>
    <DataGrid rows={filteredData} columns={columns} components={{ Toolbar: GridToolbar }} />
  </Box>
);


const BaggageInfoDialog = ({ open, onClose, baggageInfo }) => {
  const theme = useTheme();

  return (

   <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        <Typography variant="h6" align="center">Baggage Information</Typography>
      </DialogTitle>
      <DialogContent dividers sx={{ maxHeight: '120vh', overflowY: 'auto' }}>


      {baggageInfo ? (
        <Box>
          {/* Passenger Details */}
          <Typography 
          variant="subtitle1" 
          gutterBottom 
          sx={{ 
            color: theme.palette.mode === 'dark' ? '#fff' : theme.palette.primary.main,
            fontSize: '1.5rem'  // Adjust the font size here
          }}
        >
          Passenger Details
        </Typography>

          <Grid container spacing={2} mb={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1"><strong>Passport Number:</strong> {baggageInfo.passportNumber}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1"><strong>Name:</strong> {baggageInfo.firstName} {baggageInfo.middleName} {baggageInfo.surName}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1"><strong>Nationality:</strong> {baggageInfo.nationality}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1"><strong>Date of Last Departure:</strong> {baggageInfo.dateOfLastDeparture}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1"><strong>Country of Origin:</strong> {baggageInfo.countryOfOrigin}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1"><strong>Date of Arrival:</strong> {baggageInfo.dateOfArrival}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1"><strong>Flight/Vessel:</strong> {baggageInfo.flightOrVessel}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1"><strong>Airport Arrival:</strong> {baggageInfo.airportArrival}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1"><strong>Traveler Type:</strong> {baggageInfo.travelerType}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1"><strong>Purpose of Travel:</strong> {baggageInfo.purposeOfTravel}</Typography>
            </Grid>
          </Grid>

          <Divider />

          {/* Baggage Details */}
          <Box my={2}>
              <Typography
          variant="subtitle1"
          gutterBottom
          sx={{ 
            color: theme.palette.mode === 'dark' ? '#fff' : theme.palette.primary.main,
            fontSize: '1.2rem' // Optional: Adjust font size as needed
          }}
        >
          Baggage Details <Luggage fontSize="small" />
        </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1"><strong>Goods Value:</strong> {baggageInfo.goodsValue}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1"><strong>Peso/Dollar Value:</strong> {baggageInfo.pesoDollarValue}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1"><strong>Checked In Baggage:</strong> {baggageInfo.numberOfBaggage.checkedIn}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1"><strong>Hand Carried Baggage:</strong> {baggageInfo.numberOfBaggage.handCarried}</Typography>
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* Family Information */}
          <Box my={2}>
          <Typography
          variant="subtitle1"
          gutterBottom
          sx={{ 
            color: theme.palette.mode === 'dark' ? '#fff' : theme.palette.primary.main,
            fontSize: '1.2rem'
          }}
        >
          Family Information <FamilyRestroom fontSize="small" />
        </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1"><strong>Family Members Below 18:</strong> {baggageInfo.familyMembers.below18}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1"><strong>Family Members Above 18:</strong> {baggageInfo.familyMembers.above18}</Typography>
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* Bringing Items */}
          <Box my={2}>
          <Typography
          variant="subtitle1"
          gutterBottom
          sx={{ 
            color: theme.palette.mode === 'dark' ? '#fff' : theme.palette.primary.main,
            fontSize: '1.2rem'
          }}
        >
          Bringing Items <Flight fontSize="small" />
        </Typography>
            <Grid container spacing={2}>
              {baggageInfo.bringingItems && Object.keys(baggageInfo.bringingItems).map((item) => {
                const value = baggageInfo.bringingItems[item];
                if (value !== false) {
                  return (
                    <Grid item xs={12} sm={6} key={item}>
                      <Typography variant="body2">
                        - {item}{value !== true ? `: ${value}` : ''}
                      </Typography>
                    </Grid>
                  );
                }
                return null;
              })}
            </Grid>
          </Box>

          {/* Image */}
          {baggageInfo.image && (
            <Box my={2} textAlign="center">
              <img src={baggageInfo.image} alt="Baggage" style={{ width: '100%', height: 'auto', borderRadius: '4px', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)' }} />
            </Box>
          )}

        </Box>
      ) : (
        <Typography>No baggage information available.</Typography>
      )}
    </DialogContent>
    <DialogActions>
      <Button variant="outlined" onClick={onClose}>Close</Button>
    </DialogActions>
  </Dialog>
  );
};

export default Contacts;
