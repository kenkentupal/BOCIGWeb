import React, { useEffect, useState } from "react";
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
import { useTheme } from "@mui/material/styles";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadString } from "firebase/storage"; // Storage functions
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import { CircularProgress } from "@mui/material";
import airportList from "../airportlist";

const AddBaggage = ({
  open,
  setOpen,
  passportNumber,
  passengerDetails,
  firstName,
  surName,
  middleName,
  gender,
  dateOfBirth,
  nationality,
  placeIssued,
  occupation,
  time,
}) => {
  const [baggageInfo, setBaggageInfo] = useState({
    firstName: "",
    surName: "",
    middleName: "",
    gender: "",
    dateOfBirth: "",
    nationality: "",
    placeIssued: "",
    occupation: "",
    passportNumber: "",
    dateOfLastDeparture: "",
    countryOfOrigin: "",
    dateOfArrival: "",
    flightOrVessel: "",
    airportArrival: "",
    familyMembers: { below18: 0, above18: 0 },
    numberOfBaggage: { checkedIn: 0, handCarried: 0 },
    travelerType: "",
    purposeOfTravel: "",
    goodsValue: 0,
    pesoDollarValue: 0,
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
    time: "", // Add time field here
  });

  const [noDeclaration, setNoDeclaration] = useState(false);
  const handleNoDeclarationChange = (e) => {
    setNoDeclaration(e.target.checked);
    if (e.target.checked) {
      // Clear fields if "No Declaration" is checked
      setBaggageInfo((prev) => ({
        ...prev,
        dateOfLastDeparture: "",
        countryOfOrigin: "",
        dateOfArrival: "",
        flightOrVessel: "",
        airportArrival: "",
        familyMembers: { below18: 0, above18: 0 },
        numberOfBaggage: { checkedIn: 0, handCarried: 0 },
        travelerType: "",
        purposeOfTravel: "",
        goodsValue: 0,
        pesoDollarValue: 0,
        bringingItems: { otherGoods: "" },
        image: null,
      }));
    }
  };

  useEffect(() => {
    setBaggageInfo((prev) => ({
      ...prev,
      firstName: firstName || "",
      surName: surName || "",
      middleName: middleName || "",
      gender: gender || "",
      dateOfBirth: dateOfBirth || "",
      nationality: nationality || "",
      placeIssued: placeIssued || "",
      occupation: occupation || "",
      passportNumber: passportNumber || "",
    }));
  }, [
    firstName,
    surName,
    middleName,
    gender,
    dateOfBirth,
    nationality,
    placeIssued,
    occupation,
    passportNumber,
  ]);

  const [loading, setLoading] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  const handleDialogClose = () => {
    setOpen(false);
  };
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleChange = ({ target: { name, value } }) => {
    const numericValue = Math.max(0, Number(value));

    if (name === "below18" || name === "above18") {
      setBaggageInfo((prev) => ({
        ...prev,
        familyMembers: { ...prev.familyMembers, [name]: numericValue },
      }));
    } else if (name === "checkedIn" || name === "handCarried") {
      setBaggageInfo((prev) => ({
        ...prev,
        numberOfBaggage: { ...prev.numberOfBaggage, [name]: numericValue },
      }));
    } else if (name === "otherGoods") {
      setBaggageInfo((prev) => ({
        ...prev,
        bringingItems: { ...prev.bringingItems, otherGoods: value },
      }));
    } else {
      setBaggageInfo((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckboxChange = ({ target: { name, checked } }) => {
    setBaggageInfo((prev) => ({
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
      setBaggageInfo((prev) => ({
        ...prev,
        image: canvas.toDataURL("image/png"),
      }));
      stream.getTracks().forEach((track) => track.stop());
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

    return requiredFields.every((field) => field !== "" && field !== null);
  };

  const handleSubmit = async () => {
    const db = getFirestore(); // Initialize Firestore
    const storage = getStorage(); // Initialize Storage

    // Log the values of baggageInfo to the console
    console.log("Passport Number:", baggageInfo.passportNumber);
    console.log("Baggage Info:", baggageInfo);

    if (!validateFields()) {
      setSnackbarOpen(true); // Open the Snackbar instead of alert
      return;
    }

    // Calculate the risk score
    // Calculate the risk score
    const calculateRiskScore = () => {
      let score = 0;

      // 1. Traveler Profile Information
      // Nationality: Filipino: +1 point, Non-Filipino: +3 points
      if (baggageInfo.nationality === "Filipino") {
        score += 1;
      } else {
        score += 3;
      }
      // Type of Traveler: OFW, Resident: +1 point, Non-Filipino, Non-resident, Diplomat: +3 points, On-Board Courier, Crew: +2 points
      if (
        baggageInfo.typeOfTraveler === "OFW" ||
        baggageInfo.typeOfTraveler === "Resident"
      ) {
        score += 1;
      } else if (
        baggageInfo.typeOfTraveler === "Non-Filipino" || // Added Non-Filipino as a traveler type
        baggageInfo.typeOfTraveler === "Non-resident" ||
        baggageInfo.typeOfTraveler === "Diplomat"
      ) {
        score += 3;
      } else if (
        baggageInfo.typeOfTraveler === "On-Board Courier" ||
        baggageInfo.typeOfTraveler === "Crew"
      ) {
        score += 2;
      }

      // Number of Accompanying Family Members: 1-2 family members: +1 point, 3+ family members: +2 points
      if (baggageInfo.familyMembers.above18 >= 3) {
        score += 2;
      } else if (baggageInfo.familyMembers.above18 >= 1) {
        score += 1;
      }

      // 2. Travel History
      // Date of Last Departure from the Philippines
      const departureDate = new Date(baggageInfo.lastDeparture);
      const today = new Date();
      const monthsDiff =
        (today.getFullYear() - departureDate.getFullYear()) * 12 +
        today.getMonth() -
        departureDate.getMonth();

      if (monthsDiff <= 1) {
        score += 3;
      } else if (monthsDiff <= 6) {
        score += 2;
      } else {
        score += 1;
      }

      // Purpose of Travel: Business: +3 points, Vacation: +2 points, Study: +2 points, Other: +1 point
      if (baggageInfo.travelPurpose === "Business") {
        score += 3;
      } else if (
        baggageInfo.travelPurpose === "Vacation" ||
        baggageInfo.travelPurpose === "Study"
      ) {
        score += 2;
      } else {
        score += 1;
      }

      // 3. Baggage Information
      // Number of Baggage: 1–2 checked-in bags: +1 point, 3–4 checked-in bags: +2 points, 5+ checked-in bags: +3 points
      if (baggageInfo.numberOfBaggage.checkedIn <= 2) {
        score += 1;
      } else if (baggageInfo.numberOfBaggage.checkedIn <= 4) {
        score += 2;
      } else {
        score += 3;
      }

      // Hand-Carried Bags: 1–2 items: +1 point, 3+ items: +2 points
      if (baggageInfo.numberOfBaggage.handCarried <= 2) {
        score += 1;
      } else {
        score += 2;
      }

      // 4. Declarations (Items in Baggage)
      // Assign scores based on the declared items

      // Foreign Currency (exceeding USD10,000): +4 points
      if (baggageInfo.pesoDollarValue > 10000) {
        score += 4;
      }

      // Gambling Paraphernalia: +5 points
      if (baggageInfo.bringingItems.gambling) {
        score += 5;
      }

      // Cosmetics, Skin Care, Food Supplements (in excess of personal use): +3 points
      if (baggageInfo.bringingItems.cosmetics) {
        score += 3;
      }

      // Dangerous Drugs (morphine, marijuana, synthetic drugs, etc.): +10 points
      if (baggageInfo.bringingItems.drugs) {
        score += 10;
      }

      // Firearms, Ammunition, Explosives: +10 points
      if (baggageInfo.bringingItems.firearms) {
        score += 10;
      }

      // Alcohol/Tobacco Products in Commercial Quantities: +4 points
      if (baggageInfo.bringingItems.alcoholTobacco) {
        score += 4;
      }

      // Foodstuff, Plants, or Animal Products: +5 points
      if (baggageInfo.bringingItems.foodstuff) {
        score += 5;
      }

      // Mobile Phones, Radios, Communication Equipment (exceeding personal use): +3 points
      if (baggageInfo.bringingItems.electronics) {
        score += 3;
      }

      // Cremains (human ashes), Human Organs or Tissues: +6 points
      if (baggageInfo.bringingItems.cremains) {
        score += 6;
      }

      // Jewelry, Gold, Precious Metals: +3 points
      if (baggageInfo.bringingItems.jewelry) {
        score += 3;
      }

      // Other Goods (not mentioned above): +2 points
      if (baggageInfo.bringingItems.otherGoods) {
        score += 2;
      }

      // Return the calculated risk score
      return score;
    };

    // Set the current time
    const currentTime = new Date().toISOString(); // You can adjust the format if needed
    const updatedBaggageInfo = {
      ...baggageInfo,
      time: currentTime,
      declaration: !noDeclaration, // Add declaration field here
      riskScore: calculateRiskScore(), // Add the risk score
    };

    // Create the document ID
    const docId = `${updatedBaggageInfo.passportNumber}${updatedBaggageInfo.dateOfArrival}`;

    try {
      // Save baggage info to Firestore
      await setDoc(doc(db, "BaggageInfo", docId), updatedBaggageInfo);
      console.log("Baggage info saved successfully!");

      // Upload the image to Firebase Storage
      const imageRef = ref(
        storage,
        `FaceImages/${updatedBaggageInfo.airportArrival}/${updatedBaggageInfo.airportArrival}wait/${docId}.png`
      );
      const imageData = updatedBaggageInfo.image; // Assuming image is stored as a data URL

      // Upload the image
      await uploadString(imageRef, imageData, "data_url"); // Upload the image as a data URL
      console.log("Image uploaded successfully!");
    } catch (error) {
      console.error("Error saving baggage info: ", error);
    }

    setOpen(false);
  };

  const handleClose = () => {
    if (Object.values(baggageInfo).some((value) => value)) {
      setShowConfirmation(true);
    } else {
      resetData();
      setOpen(false);
    }
  };

  const resetData = () => {
    setBaggageInfo({
      passportNumber: passportNumber || "",
      passengerDetails: passengerDetails || "",
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

  return (
    <>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          Add Baggage Declaration for {firstName} {middleName} {surName}{" "}
          (Passport: {passportNumber})
          <IconButton
            aria-label="close"
            onClick={setShowConfirmation}
            onClose={() => handleConfirmationClose(false)}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <FormControlLabel
            control={
              <Checkbox
                checked={noDeclaration}
                onChange={handleNoDeclarationChange}
              />
            }
            label="No Declaration"
          />

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
            value={baggageInfo.dateOfLastDeparture || ""} // Fallback to empty string
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
            value={baggageInfo.countryOfOrigin || ""} // Fallback to empty string
            onChange={handleChange}
            autoComplete="off"
          />
          <TextField
            margin="dense"
            label="Date of Arrival"
            type="date"
            fullWidth
            name="dateOfArrival"
            value={baggageInfo.dateOfArrival || ""} // Fallback to empty string
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
            value={baggageInfo.flightOrVessel || ""} // Fallback to empty string
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
                value={baggageInfo.familyMembers.below18 || ""}
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
                value={baggageInfo.familyMembers.above18 || ""}
                onChange={handleChange}
                inputProps={{ min: 0 }}
              />
            </Grid>
          </Grid>
          {!noDeclaration && (
            <>
              {["checkedIn", "handCarried"].map((name) => (
                <TextField
                  key={name}
                  margin="dense"
                  label={`No. of Baggage (${
                    name === "checkedIn" ? "Checked in" : "Hand Carried"
                  })`}
                  type="number"
                  fullWidth
                  name={name}
                  value={baggageInfo.numberOfBaggage[name] || ""}
                  onChange={handleChange}
                  inputProps={{ min: 0 }}
                />
              ))}
            </>
          )}

          <FormControl fullWidth margin="dense">
            <InputLabel>Type of Traveler</InputLabel>
            <Select
              name="travelerType"
              value={baggageInfo.travelerType}
              onChange={handleChange}
            >
              {[
                "OFW",
                "Resident",
                "Non-resident",
                "On-Board Courier",
                "Non-Filipino",
                "Diplomat",
                "Crew",
              ].map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Purpose of Travel</InputLabel>
            <Select
              name="purposeOfTravel"
              value={baggageInfo.purposeOfTravel}
              onChange={handleChange}
            >
              {["Business", "Vacation", "Study"].map((purpose) => (
                <MenuItem key={purpose} value={purpose}>
                  {purpose}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {!noDeclaration && (
            <>
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
            </>
          )}

          <Button variant="outlined" onClick={handleCameraCapture}>
            Capture Image
          </Button>

          {/* Show the captured image if it exists */}
          {baggageInfo.image && (
            <img
              src={baggageInfo.image}
              alt="Captured"
              style={{
                marginTop: "16px",
                width: "100%",
                maxHeight: "100",
                objectFit: "contain",
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit}>
            {" "}
            {loading ? <CircularProgress size={24} /> : "Save"}
          </Button>
          <Snackbar
            open={snackbarOpen}
            autoHideDuration={6000}
            onClose={handleSnackbarClose}
          >
            <Alert
              onClose={handleSnackbarClose}
              severity="error"
              sx={{ width: "100%" }}
            >
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
      <Dialog
        open={successDialogOpen}
        onClose={() => setSuccessDialogOpen(false)}
      >
        <DialogTitle>Success</DialogTitle>
        <DialogContent>
          <p>Your baggage information has been successfully submitted!</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSuccessDialogOpen(false)}>OK</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddBaggage;
