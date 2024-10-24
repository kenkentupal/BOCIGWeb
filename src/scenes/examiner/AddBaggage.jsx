import React, { useEffect,useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Grid,
  Snackbar,
  Alert,
  Dialog as ConfirmationDialog,
} from "@mui/material";
import { useTheme } from '@mui/material/styles';
import { getFirestore, doc, setDoc } from 'firebase/firestore'; 
import { getStorage, ref, uploadString } from "firebase/storage"; // Storage functions
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';

const AddBaggage = ({ open, setOpen, passportNumber }) => {
  const [baggageInfo, setBaggageInfo] = useState({
    passportNumber: "",
    description: "",
    dateOfLastDeparture: "",
    countryOfOrigin: "",
    dateOfArrival: "",
    flightOrVessel: "",
    airportArrival: "",
    familyMembers: { below18: "", above18: "" },
    numberOfBaggage: { checkedIn: "", handCarried: "" },
    travelerType: "",
    purposeOfTravel: "",
    goodsValue: "",
    pesoDollarValue: "",
    bringingItems: {
      currency: false,
      foreignCurrency: false,
      gambling: false,
      cosmetics: false,
      drugs: false,
      firearms: false,
      alcoholTobacco: false,
      foodstuff: false,
      electronics: false,
      cremains: false,
      jewelry: false,
      otherGoods: "",
    },
    image: null,
  });
  const handleDialogClose = () => {
    setOpen(false);
  };
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleChange = ({ target: { name, value } }) => {
    const numericValue = Math.max(0, Number(value));

    if (name === "below18" || name === "above18") {
      setBaggageInfo(prev => ({
        ...prev,
        familyMembers: { ...prev.familyMembers, [name]: numericValue },
      }));
    } else if (name === "checkedIn" || name === "handCarried") {
      setBaggageInfo(prev => ({
        ...prev,
        numberOfBaggage: { ...prev.numberOfBaggage, [name]: numericValue },
      }));
    } else if (name === "otherGoods") {
      setBaggageInfo(prev => ({
        ...prev,
        bringingItems: { ...prev.bringingItems, otherGoods: value },
      }));
    } else {
      setBaggageInfo(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckboxChange = ({ target: { name, checked } }) => {
    setBaggageInfo(prev => ({
      ...prev,
      bringingItems: { ...prev.bringingItems, [name]: checked },
    }));
  };
  useEffect(() => {
    // Update baggageInfo when passportNumber changes
    setBaggageInfo((prev) => ({
      ...prev,
      passportNumber: passportNumber || "",
    }));
  }, [passportNumber]); 

  const handleCameraCapture = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    const video = document.createElement("video");
    video.srcObject = stream;
    video.play();
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      setBaggageInfo(prev => ({ ...prev, image: canvas.toDataURL("image/png") }));
      stream.getTracks().forEach(track => track.stop());
    };
  };
  
  const validateFields = () => {
    const requiredFields = [
      baggageInfo.passportNumber,
      baggageInfo.dateOfLastDeparture,
      baggageInfo.countryOfOrigin,
      baggageInfo.dateOfArrival,
      baggageInfo.flightOrVessel,
      baggageInfo.airportArrival,
      baggageInfo.travelerType,
      baggageInfo.purposeOfTravel,
      baggageInfo.goodsValue,
      baggageInfo.pesoDollarValue,
      baggageInfo.numberOfBaggage.checkedIn,
      baggageInfo.numberOfBaggage.handCarried,
      baggageInfo.familyMembers.below18,
      baggageInfo.familyMembers.above18,
      baggageInfo.image, // Ensure the image is also included if required
    ];
  
    return requiredFields.every(field => field !== "" && field !== null);
  };
  

  const handleSubmit = async () => {
    const db = getFirestore(); // Initialize Firestore
    const storage = getStorage(); // Initialize Storage
  
    // Log the values of baggageInfo to the console
    console.log("Passport Number:", baggageInfo.passportNumber, baggageInfo.dateOfArrival);
    console.log("Baggage Info:", baggageInfo);
    
    if (!validateFields()) {
      setSnackbarOpen(true); // Open the Snackbar instead of alert
      return;
    }
  
    try {
      // Create the document ID
      const docId = `${baggageInfo.passportNumber}${baggageInfo.dateOfArrival}`;
      
      // Save baggage info to Firestore
      await setDoc(doc(db, "BaggageInfo", docId), baggageInfo);
      
      console.log("Baggage info saved successfully!");
  
      // Upload the image to Firebase Storage
      const imageRef = ref(storage, `FaceImages/${baggageInfo.airportArrival}/${baggageInfo.airportArrival}wait/${docId}.png`);
      const imageData = baggageInfo.image; // Assuming image is stored as a data URL
  
      // Upload the image
      await uploadString(imageRef, imageData, 'data_url'); // Upload the image as a data URL
  
      console.log("Image uploaded successfully!");
  
    } catch (error) {
      console.error("Error saving baggage info: ", error);
    }
  
    setOpen(false);
  };

  const handleClose = () => {
    if (Object.values(baggageInfo).some(value => value)) {
      setShowConfirmation(true);
    } else {
      resetData();
      setOpen(false);
    }
  };

  const resetData = () => {
    setBaggageInfo({
      passportNumber: passportNumber || "",
      dateOfLastDeparture: "",
      countryOfOrigin: "",
      dateOfArrival: "",
      flightOrVessel: "",
      familyMembers: { below18: "", above18: "" },
      numberOfBaggage: { checkedIn: "", handCarried: "" },
      travelerType: "",
      purposeOfTravel: "",
      goodsValue: "",
      pesoDollarValue: "",
      bringingItems: {
        currency: false,
        foreignCurrency: false,
        gambling: false,
        cosmetics: false,
        drugs: false,
        firearms: false,
        alcoholTobacco: false,
        foodstuff: false,
        electronics: false,
        cremains: false,
        jewelry: false,
        otherGoods: "",
      },
      image: null,
    });
  };

  const handleConfirmationClose = (confirm) => {
    if (confirm) {
      resetData();
      setOpen(false); // Close the main dialog only if confirmed
    }
    setShowConfirmation(false); // Always close the confirmation dialog
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const airportList = [
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
    // Add more airports as needed
  ];

  return (
    <>
      <Dialog open={open} onClose={handleClose}>
      <DialogTitle>
          Add Baggage Declaration
          <IconButton
            aria-label="close"
            onClick={setShowConfirmation}
            onClose={() => handleConfirmationClose(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
        <TextField
  margin="dense"
  label="Passport Number"
  type="text"
  fullWidth
  name="passportNumber"
  value={baggageInfo.passportNumber} // Use baggageInfo state instead of passportNumber prop
  onChange={handleChange} // This will now update the state correctly
  disabled={true} // Keep it disabled if you don't want to allow editing
/>
       <TextField
  margin="dense"
  label="Date of Last Departure"
  type="date"
  fullWidth
  name="dateOfLastDeparture"
  value={baggageInfo.dateOfLastDeparture || ''} // Fallback to empty string
  onChange={handleChange}
  InputLabelProps={{ shrink: true }}
  autoComplete="off"
/>
<TextField
  margin="dense"
  label="Country of Origin"
  type="text"
  fullWidth
  name="countryOfOrigin"
  value={baggageInfo.countryOfOrigin || ''} // Fallback to empty string
  onChange={handleChange}
  autoComplete="off"
/>
<TextField
  margin="dense"
  label="Date of Arrival"
  type="date"
  fullWidth
  name="dateOfArrival"
  value={baggageInfo.dateOfArrival || ''} // Fallback to empty string
  onChange={handleChange}
  InputLabelProps={{ shrink: true }}
  autoComplete="off"
/>
<TextField
  margin="dense"
  label="Airline Flight No. or Vessel Name/Voyage No."
  type="text"
  fullWidth
  name="flightOrVessel"
  value={baggageInfo.flightOrVessel || ''} // Fallback to empty string
  onChange={handleChange}
  autoComplete="off"
/>

<FormControl fullWidth margin="dense">
      <InputLabel>Airport Arrival</InputLabel>
      <Select 
        name="airportArrival" 
        value={baggageInfo.airportArrival} 
        onChange={handleChange}
      >
        {airportList.map((airport) => (
          <MenuItem key={airport.code} value={airport.code}>
            {airport.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
        
          <Grid container spacing={2} marginY={2}>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                label="Members Below 18"
                type="number"
                fullWidth
                name="below18"
                value={baggageInfo.familyMembers.below18 || ''}
                onChange={handleChange}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                label="Members 18 yrs old and above"
                type="number"
                fullWidth
                name="above18"
                value={baggageInfo.familyMembers.above18 || ''}
                onChange={handleChange}
                inputProps={{ min: 0 }}
              />
            </Grid>
          </Grid>
  
          {["checkedIn", "handCarried"].map(name => (
            <TextField
              key={name}
              margin="dense"
              label={`No. of Baggage (${name === "checkedIn" ? "Checked in" : "Hand Carried"})`}
              type="number"
              fullWidth
              name={name}
              value={baggageInfo.numberOfBaggage[name] || ''}
              onChange={handleChange}
              inputProps={{ min: 0 }}
            />
          ))}
  
          <FormControl fullWidth margin="dense">
            <InputLabel>Type of Traveler</InputLabel>
            <Select name="travelerType" value={baggageInfo.travelerType} onChange={handleChange}>
              {["Filipino", "OFW", "Resident", "Non-resident", "On-Board Courier", "Non-Filipino", "Diplomat", "Crew"].map((type) => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Purpose of Travel</InputLabel>
            <Select name="purposeOfTravel" value={baggageInfo.purposeOfTravel} onChange={handleChange}>
              {["Business", "Vacation", "Study"].map((purpose) => (
                <MenuItem key={purpose} value={purpose}>{purpose}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Value of Goods"
            type="number"
            fullWidth
            name="goodsValue"
            value={baggageInfo.goodsValue}
            onChange={handleChange}
            inputProps={{ min: 0 }}
          />
          <TextField
            margin="dense"
            label="Peso/Dollar Value"
            type="number"
            fullWidth
            name="pesoDollarValue"
            value={baggageInfo.pesoDollarValue}
            onChange={handleChange}
            inputProps={{ min: 0 }}
          />
  
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  name="currency"
                  checked={baggageInfo.bringingItems.currency}
                  onChange={handleCheckboxChange}
                />
              }
              label="Currency"
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="foreignCurrency"
                  checked={baggageInfo.bringingItems.foreignCurrency}
                  onChange={handleCheckboxChange}
                />
              }
              label="Foreign Currency"
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="gambling"
                  checked={baggageInfo.bringingItems.gambling}
                  onChange={handleCheckboxChange}
                />
              }
              label="Gambling"
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="cosmetics"
                  checked={baggageInfo.bringingItems.cosmetics}
                  onChange={handleCheckboxChange}
                />
              }
              label="Cosmetics"
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="drugs"
                  checked={baggageInfo.bringingItems.drugs}
                  onChange={handleCheckboxChange}
                />
              }
              label="Drugs"
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="firearms"
                  checked={baggageInfo.bringingItems.firearms}
                  onChange={handleCheckboxChange}
                />
              }
              label="Firearms"
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="alcoholTobacco"
                  checked={baggageInfo.bringingItems.alcoholTobacco}
                  onChange={handleCheckboxChange}
                />
              }
              label="Alcohol/Tobacco"
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="foodstuff"
                  checked={baggageInfo.bringingItems.foodstuff}
                  onChange={handleCheckboxChange}
                />
              }
              label="Foodstuff"
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="electronics"
                  checked={baggageInfo.bringingItems.electronics}
                  onChange={handleCheckboxChange}
                />
              }
              label="Electronics"
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="cremains"
                  checked={baggageInfo.bringingItems.cremains}
                  onChange={handleCheckboxChange}
                />
              }
              label="Cremains"
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="jewelry"
                  checked={baggageInfo.bringingItems.jewelry}
                  onChange={handleCheckboxChange}
                />
              }
              label="Jewelry"
            />
            <TextField
              margin="dense"
              label="Other Goods"
              type="text"
              fullWidth
              name="otherGoods"
              value={baggageInfo.bringingItems.otherGoods}
              onChange={handleChange}
            />
          </FormGroup>
  
          <Button variant="outlined" onClick={handleCameraCapture}>Capture Image</Button>
          
          {/* Show the captured image if it exists */}
          {baggageInfo.image && (
            <img
              src={baggageInfo.image}
              alt="Captured"
              style={{
                marginTop: '16px',
                width: '100%',
                maxHeight: '100',
                objectFit: 'contain',
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Save
            
          </Button>
          <Snackbar
  open={snackbarOpen}
  autoHideDuration={6000}
  onClose={handleSnackbarClose}
>
  <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: '100%' }}>
    Please fill out all required fields!
  </Alert>
</Snackbar>
        </DialogActions>
        
      </Dialog>
  
      <ConfirmationDialog
        open={showConfirmation}
        onClose={() => handleConfirmationClose(false)}
      >
        <DialogTitle>Unsaved Changes</DialogTitle>
        <DialogContent>
          <p>Are you sure you want to discard your changes?</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleConfirmationClose(false)}>Cancel</Button>
          <Button onClick={() => handleConfirmationClose(true)}>Confirm</Button>
        </DialogActions>
        
      </ConfirmationDialog>
    </>
    
  );
  
};

export default AddBaggage;
