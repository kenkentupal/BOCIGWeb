import { useEffect, useState } from "react";
import { Box, Modal, IconButton, Typography, TextField, Button, MenuItem, Dialog, DialogActions, DialogContent, DialogTitle, Menu } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { collection, onSnapshot, setDoc,getDocs, doc } from "firebase/firestore"; // Changed getDocs to onSnapshot
import { getStorage } from "firebase/storage";
import { db } from "../../Firebase";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddBaggage from "./AddBaggage"; 
import ViewBaggage from "./ViewBaggage"; 
import SearchIcon from '@mui/icons-material/Search';

const Contacts = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [openConfirmation, setOpenConfirmation] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [newPassenger, setNewPassenger] = useState(initialPassengerState());
  const [formErrors, setFormErrors] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const storage = getStorage();
  const [openBaggageForm, setOpenBaggageForm] = useState(false);
  const [openBaggageList, setOpenBaggageList] = useState(false);
  const [selectedPassportNumber, setSelectedPassportNumber] = useState("");

  const columns = createColumns(storage, setSelectedImage, setOpen, setAnchorEl, setSelectedPassportNumber);
  
  useEffect(() => {
    // Set up a Firestore listener for real-time updates
    const unsubscribe = onSnapshot(collection(db, "ResultTable"), (querySnapshot) => {
      const fetchedData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Sort the data by the "Time" field in descending order
      const sortedData = fetchedData.sort((a, b) => new Date(b.Time) - new Date(a.Time));

      setData(sortedData);
      setFilteredData(sortedData); // Set both data and filtered data
    }, (error) => {
      console.error("Error fetching Firestore data: ", error);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const fetchData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "ResultTable"));
      const fetchedData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Sort the data by the "Time" field in descending order
      const sortedData = fetchedData.sort((a, b) => new Date(b.Time) - new Date(a.Time));
      
      setData(sortedData);
      setFilteredData(sortedData); // Set both data and filtered data
    } catch (error) {
      console.error("Error fetching Firestore data: ", error);
    }
  };
  
  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleAddBaggage = () => {
    const selectedPassenger = filteredData.find(item => item["Document Number"] === selectedPassportNumber);
    console.log("Selected Passenger Details:", selectedPassenger); // Log the selected passenger details
    setOpenBaggageForm(true); // Open the AddBaggage modal
    setAnchorEl(null); // Close the menu
  };

  const handleViewBaggage = () => {
    console.log("Selected Passport Number:", selectedPassportNumber); // Log the selected passport number
    setOpenBaggageList(true); // Open the AddBaggage modal
    setAnchorEl(null); // Close the menu
  };

  const handleSearch = () => {
    const filtered = data.filter(item => String(item["Document Number"] || "").toLowerCase().includes(searchQuery.toLowerCase()));
    setFilteredData(filtered);
    setNewPassenger(prevState => ({
      ...prevState,
      passportNumber: filtered.length > 0 ? filtered[0]["Document Number"] : searchQuery
    }));

    if (filtered.length === 0 && searchQuery) {
      setOpenConfirmation(true);
    }
  };

  const handleReload = () => {
    setSearchQuery("");
    setFilteredData(data); // Reset filtered data to show all
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewPassenger(prevState => ({ ...prevState, [name]: value }));
  };

  const validateForm = () => {
    const errors = {};
    ["passportNumber", "firstName", "surname", "gender", "birthdate", "nationality", "placeIssued", "occupation"].forEach(field => {
      if (!newPassenger[field]) errors[field] = `${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`;
    });
    return errors;
  };

  const handleFormSubmit = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
  
    // Create a new object with the required keys
    const passengerData = {
      "Date of Birth": newPassenger.birthdate,
      "Document Number": newPassenger.passportNumber,
      "First Name": newPassenger.firstName,
      "Gender": newPassenger.gender,
      "Last Name": newPassenger.surname,
      "Middle Name": newPassenger.middleName,
      "Nationality": newPassenger.nationality,
      "Occupation": newPassenger.occupation,
      "Place Issued": newPassenger.placeIssued,
      "Time": new Date().toISOString(), // Ensure the time is in the correct format
    };
  
    try {
      await setDoc(doc(db, "ResultTable", newPassenger.passportNumber), passengerData);
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Error saving new passenger data: ", error);
    }
  };
  

  const handleConfirmCreatePassenger = () => {
    setOpenConfirmation(false);
    setOpenForm(true);
  };

  const resetForm = () => {
    setOpenForm(false);
    setSearchQuery("");
    setNewPassenger(initialPassengerState());
  };

    // Rest of your component...
    return (
      <Box m="20px">
        <Header title="Passenger Information" subtitle="List of Passenger Information" />
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleSearch={handleSearch}
          handleReload={handleReload}
          theme={theme}
          colors={colors}
        />
        <DataGridContainer filteredData={filteredData} colors={colors} columns={columns} />
        <ConfirmationDialog open={openConfirmation} setOpen={setOpenConfirmation} handleConfirm={handleConfirmCreatePassenger} />
        <PassengerForm open={openForm} setOpen={setOpenForm} newPassenger={newPassenger} handleFormChange={handleFormChange} formErrors={formErrors} handleFormSubmit={handleFormSubmit} theme={theme} colors={colors} />
        <AddBaggage open={openBaggageForm} setOpen={setOpenBaggageForm} passportNumber={selectedPassportNumber} 
          firstName={filteredData.find(item => item["Document Number"] === selectedPassportNumber)?.["First Name"]}
          surName={filteredData.find(item => item["Document Number"] === selectedPassportNumber)?.["Last Name"]}
          middleName={filteredData.find(item => item["Document Number"] === selectedPassportNumber)?.["Middle Name"]}
          gender={filteredData.find(item => item["Document Number"] === selectedPassportNumber)?.["Gender"]}
          dateOfBirth={filteredData.find(item => item["Document Number"] === selectedPassportNumber)?.["Date of Birth"]}
          nationality={filteredData.find(item => item["Document Number"] === selectedPassportNumber)?.["Nationality"]}
          placeIssued={filteredData.find(item => item["Document Number"] === selectedPassportNumber)?.["Place Issued"]}
          occupation={filteredData.find(item => item["Document Number"] === selectedPassportNumber)?.["Occupation"]}
        />
        <ViewBaggage open={openBaggageList} onClose={() => setOpenBaggageList(false)} passportNumber={selectedPassportNumber} />
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          <MenuItem onClick={handleAddBaggage}>Add Baggage Declaration</MenuItem>
          <MenuItem onClick={handleViewBaggage}>View Baggage Declaration</MenuItem>
        </Menu>
      </Box>
    );
  };

const initialPassengerState = () => ({
  firstName: "",
  middleName: "",
  surname: "",
  gender: "",
  birthdate: "",
  nationality: "",
  passportNumber: "",
  placeIssued: "",
  occupation: "",
});

const createColumns = (storage, setSelectedImage, setOpen, setAnchorEl, setSelectedPassportNumber) => [
  { field: "id", headerName: "ID", flex: 1 },
  { field: "First Name", headerName: "First Name", flex: 1 },
  { field: "Last Name", headerName: "Last Name", flex: 1 },
  { field: "Gender", headerName: "Gender", flex: 1 },
  { field: "Date of Birth", headerName: "Date of Birth", flex: 1 },
  { field: "Nationality", headerName: "Nationality", flex: 1 },
  { field: "Place Issued", headerName: "Place Issued", flex: 1 },
  { field: "Occupation", headerName: "Occupation", flex: 1 },
  { field: "Time", headerName: "Time", flex: 1, type: 'dateTime', valueGetter: ({ value }) => value && new Date(value), sortDirection: 'desc' }, // Add Time column
  {
    field: "actions",
    headerName: "",
    flex: 1,
    renderCell: (params) => (
      <IconButton onClick={(event) => {
        setSelectedPassportNumber(params.row["Document Number"]); // Set the selected passport number
        setAnchorEl(event.currentTarget);
      }}>
        <MoreVertIcon />
      </IconButton>
    ),
  },
];


const SearchBar = ({ searchQuery, setSearchQuery, handleSearch, handleReload, theme, colors }) => (
  <Box width="50%" mx="auto" mb={2}>
    <Box display="flex" alignItems="center">
      <TextField
        label="Search by Passport Number"
        variant="outlined"
        placeholder="Enter Passport Number"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        fullWidth
        InputProps={{
          style: {
            backgroundColor: theme.palette.mode === 'dark' ? colors.primary[500] : '#fff',
            color: theme.palette.mode === 'dark' ? colors.grey[100] : '#000',
            borderRadius: '5px',
          },
        }}
        InputLabelProps={{
          style: {
            color: theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[800],
          },
        }}
      />
      <IconButton onClick={handleSearch}>
        <SearchIcon />
      </IconButton>
      <IconButton onClick={handleReload}>
        <RefreshIcon />
      </IconButton>
    </Box>
  </Box>
);

const DataGridContainer = ({ filteredData, colors, columns }) => (
  <Box m="40px 0 0 0" height="75vh" sx={{
    "& .MuiDataGrid-root": { border: "none" },
    "& .MuiDataGrid-cell": { borderBottom: "none" },
    "& .name-column--cell": { color: colors.greenAccent[300] },
    "& .MuiDataGrid-columnHeaders": { backgroundColor: colors.blueAccent[700], borderBottom: "none" },
    "& .MuiDataGrid-virtualScroller": { backgroundColor: colors.primary[400] },
    "& .MuiDataGrid-footerContainer": { borderTop: "none", backgroundColor: colors.blueAccent[700] },
    "& .MuiCheckbox-root": { color: `${colors.greenAccent[200]} !important` },
    "& .MuiDataGrid-toolbarContainer .MuiButton-text": { color: `${colors.grey[100]} !important` },
  }}>
    <DataGrid rows={filteredData} columns={columns} components={{ Toolbar: GridToolbar }} />
  </Box>
);

const ConfirmationDialog = ({ open, setOpen, handleConfirm }) => (
  <Dialog open={open} onClose={() => setOpen(false)}>
    <DialogTitle>Confirmation</DialogTitle>
    <DialogContent>
      <Typography>Passenger not found. Would you like to create a new passenger?</Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={() => setOpen(false)}>Cancel</Button>
      <Button onClick={handleConfirm}>Confirm</Button>
    </DialogActions>
  </Dialog>
);

const PassengerForm = ({ open, setOpen, newPassenger, handleFormChange, formErrors, handleFormSubmit, theme, colors }) => (
  <Dialog open={open} onClose={() => setOpen(false)}>
    <DialogTitle>Add New Passenger</DialogTitle>
    <DialogContent>
      <TextField
        label="Passport Number"
        name="passportNumber"
        value={newPassenger.passportNumber}
        onChange={handleFormChange}
        error={!!formErrors.passportNumber}
        helperText={formErrors.passportNumber}
        fullWidth
        margin="normal"
      />
      <TextField
        label="First Name"
        name="firstName"
        value={newPassenger.firstName}
        onChange={handleFormChange}
        error={!!formErrors.firstName}
        helperText={formErrors.firstName}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Middle Name"
        name="middleName"
        value={newPassenger.middleName}
        onChange={handleFormChange}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Last Name"
        name="surname"
        value={newPassenger.surname}
        onChange={handleFormChange}
        error={!!formErrors.surname}
        helperText={formErrors.surname}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Gender"
        name="gender"
        value={newPassenger.gender}
        onChange={handleFormChange}
        error={!!formErrors.gender}
        helperText={formErrors.gender}
        select
        fullWidth
        margin="normal"
      >
        <MenuItem value="Male">Male</MenuItem>
        <MenuItem value="Female">Female</MenuItem>
        <MenuItem value="Other">Other</MenuItem>
      </TextField>
      <TextField
        label="Date of Birth"
        name="birthdate"
        type="date"
        value={newPassenger.birthdate}
        onChange={handleFormChange}
        error={!!formErrors.birthdate}
        helperText={formErrors.birthdate}
        fullWidth
        margin="normal"
        InputLabelProps={{
          shrink: true,
        }}
      />
      <TextField
        label="Nationality"
        name="nationality"
        value={newPassenger.nationality}
        onChange={handleFormChange}
        error={!!formErrors.nationality}
        helperText={formErrors.nationality}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Place Issued"
        name="placeIssued"
        value={newPassenger.placeIssued}
        onChange={handleFormChange}
        error={!!formErrors.placeIssued}
        helperText={formErrors.placeIssued}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Occupation"
        name="occupation"
        value={newPassenger.occupation}
        onChange={handleFormChange}
        error={!!formErrors.occupation}
        helperText={formErrors.occupation}
        fullWidth
        margin="normal"
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={() => setOpen(false)}>Cancel</Button>
      <Button onClick={handleFormSubmit}>Submit</Button>
    </DialogActions>
  </Dialog>
);

export default Contacts;