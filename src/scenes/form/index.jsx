import React, { useState } from "react";
import { Box, Button, TextField, MenuItem, Select, FormControl, InputLabel, Dialog, DialogActions, DialogContent, DialogTitle, Snackbar, Alert, CircularProgress } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import { auth, db } from "../../Firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const generateRandomPassword = (length = 12) => {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
};

const Form = () => {
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [openDialog, setOpenDialog] = useState(false); // State to manage Dialog visibility
  const [loading, setLoading] = useState(false); // State to manage loading
  const [formValues, setFormValues] = useState(null); // State to store form values temporarily
  const isNonMobile = useMediaQuery("(min-width:600px)");

  const handleFormSubmit = (values) => {
    // Store form values temporarily and open the dialog
    setFormValues(values);
    setOpenDialog(true);
  };

  const handleDialogClose = async (confirm) => {
    setOpenDialog(false);
    if (confirm && formValues) {
      try {
        setLoading(true); // Set loading state before processing

        // Generate a random password
        const randomPassword = generateRandomPassword();

        // Create user with Firebase Authentication
        await createUserWithEmailAndPassword(auth, formValues.email, randomPassword); // Use the random password

        // Save user information to Firestore
        const user = auth.currentUser; // Get the current user
        if (user) {
          await setDoc(doc(db, "Users", user.uid), {
            fname: formValues.firstName,
            lname: formValues.lastName,
            email: formValues.email,
            contact: formValues.contact,
            accessLevel: formValues.accessLevel,
            password: randomPassword // Store the password securely (if needed)
          });

          // Login the new user
          await signInWithEmailAndPassword(auth, formValues.email, randomPassword);

          // Send password to user's email
          await sendPasswordResetEmail(auth, formValues.email);

          // Show success message
          setSnackbarMessage("User created successfully! Please check your email for the password.");
          setOpenSnackbar(true);
        }

        // Immediately log out the user
        await signOut(auth);
      } catch (error) {
        console.error("Error creating user:", error);
        setSnackbarMessage(`Error: ${error.message}`);
        setOpenSnackbar(true);
      } finally {
        setLoading(false); // Reset loading state
        setFormValues(null); // Clear the form values
      }
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Box m="20px">
      <Header title="CREATE USER" subtitle="Create a New User Profile" />

      <Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={checkoutSchema}
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
        }) => (
          <form onSubmit={handleSubmit}>
            <Box
              display="grid"
              gap="30px"
              gridTemplateColumns="repeat(4, minmax(0, 1fr))"
              sx={{
                "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
              }}
            >
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="First Name"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.firstName}
                name="firstName"
                error={!!touched.firstName && !!errors.firstName}
                helperText={touched.firstName && errors.firstName}
                sx={{ gridColumn: "span 2" }}
                disabled={loading} // Disable input when loading
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Last Name"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.lastName}
                name="lastName"
                error={!!touched.lastName && !!errors.lastName}
                helperText={touched.lastName && errors.lastName}
                sx={{ gridColumn: "span 2" }}
                disabled={loading} // Disable input when loading
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Email"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.email}
                name="email"
                error={!!touched.email && !!errors.email}
                helperText={touched.email && errors.email}
                sx={{ gridColumn: "span 4" }}
                disabled={loading} // Disable input when loading
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Contact Number"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.contact}
                name="contact"
                error={!!touched.contact && !!errors.contact}
                helperText={touched.contact && errors.contact}
                sx={{ gridColumn: "span 4" }}
                disabled={loading} // Disable input when loading
              />
              <FormControl fullWidth variant="filled" sx={{ gridColumn: "span 4" }}>
                <InputLabel>Access Level</InputLabel>
                <Select
                  value={values.accessLevel}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  name="accessLevel"
                  error={!!touched.accessLevel && !!errors.accessLevel}
                  disabled={loading} // Disable select when loading
                >
                  <MenuItem value="manager">Manager</MenuItem>
                  <MenuItem value="user">User</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box display="flex" justifyContent="end" mt="20px">
              <Button type="submit" color="secondary" variant="contained" disabled={loading}>
                {loading ? <CircularProgress size={24} /> : "Create New User"}
              </Button>
            </Box>
          </form>
        )}
      </Formik>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="success">
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Dialog
        open={openDialog}
        onClose={() => handleDialogClose(false)} // Close dialog without confirming
      >
        <DialogTitle>Confirm</DialogTitle>
        <DialogContent>
          <p>Do you want to create this user? After confirmation, you will be logged out immediately.</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleDialogClose(true)} color="secondary">
            OK
          </Button>
          <Button onClick={() => handleDialogClose(false)} color="secondary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const phoneRegExp =
  /^((\+[1-9]{1,4}[ -]?)|(\([0-9]{2,3}\)[ -]?)|([0-9]{2,4})[ -]?)*?[0-9]{3,4}[ -]?[0-9]{3,4}$/;

const checkoutSchema = yup.object().shape({
  firstName: yup.string().required("required"),
  lastName: yup.string().required("required"),
  email: yup.string().email("invalid email").required("required"),
  contact: yup
    .string()
    .matches(phoneRegExp, "Phone number is not valid")
    .required("required"),
  accessLevel: yup.string().oneOf(["manager", "user"], "Invalid access level").required("required"),
});

const initialValues = {
  firstName: "",
  lastName: "",
  email: "",
  contact: "",
  accessLevel: "user", // Default value
};

export default Form;
