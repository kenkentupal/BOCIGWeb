import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  useTheme,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Menu,
  MenuItem,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import FlightTakeoffOutlinedIcon from "@mui/icons-material/FlightTakeoffOutlined";

import Header from "../../components/Header";
import { db, collection, getDocs } from "../../Firebase";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

const Team = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null); // For menu
  const [selectedUserEmail, setSelectedUserEmail] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [dialogAction, setDialogAction] = useState(null); // New state to track the action
  const [snackbarOpen, setSnackbarOpen] = useState(false); // Snackbar visibility state
  const [snackbarMessage, setSnackbarMessage] = useState(""); // Snackbar message
  const navigate = useNavigate();
  const openMenu = Boolean(anchorEl);

  // Define columns for DataGrid
  const columns = [
    { field: "id", headerName: "ID", flex: 1 },
    {
      field: "fname",
      headerName: "First Name",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "lname",
      headerName: "Last Name",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "contact",
      headerName: "Phone Number",
      flex: 1,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
    },
    {
      field: "accessLevel",
      headerName: "Access Level",
      flex: 1,
      renderCell: ({ row: { accessLevel } }) => (
        <Box
          width="60%"
          m="0 auto"
          p="5px"
          display="flex"
          justifyContent="center"
          backgroundColor={
            accessLevel === "admin"
              ? colors.greenAccent[600]
              : accessLevel === "manager"
              ? colors.greenAccent[700]
              : colors.greenAccent[700]
          }
          borderRadius="4px"
        >
          {accessLevel === "admin" && <AdminPanelSettingsOutlinedIcon />}
          {accessLevel === "manager" && <AdminPanelSettingsOutlinedIcon />}
          {accessLevel === "examiner" && <SecurityOutlinedIcon />}
          {accessLevel === "airliner" && <FlightTakeoffOutlinedIcon />}
          <Typography color={colors.grey[100]} sx={{ ml: "5px" }}>
            {accessLevel}
          </Typography>
        </Box>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      renderCell: (params) => (
        <Box display="flex" justifyContent="center">
          <IconButton
            onClick={(event) =>
              handleMenuClick(event, params.row.email, params.row.id)
            }
          >
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem
              onClick={() =>
                handleResetPassword(params.row.email, params.row.id)
              }
            >
              Reset Password
            </MenuItem>
          </Menu>
        </Box>
      ),
    },
  ];

  const handleMenuClick = (event, email, id) => {
    setAnchorEl(event.currentTarget);
    setSelectedUserEmail(email);
    setSelectedUserId(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleResetPassword = (email, id) => {
    setDialogAction("resetPassword");
    setOpenDialog(true);
    handleMenuClose(); // Close the menu
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleConfirmAction = async () => {
    if (dialogAction === "resetPassword") {
      try {
        const auth = getAuth();
        await sendPasswordResetEmail(auth, selectedUserEmail);
        setSnackbarMessage("Password reset email sent successfully.");
        setSnackbarOpen(true); // Open the Snackbar
      } catch (error) {
        setSnackbarMessage(
          "Error sending password reset email: " + error.message
        );
        setSnackbarOpen(true); // Open the Snackbar
      }
    }
    setOpenDialog(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
          navigate("/login");
          return;
        }

        const querySnapshot = await getDocs(collection(db, "Users"));
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Define a custom sort order for access levels
        const accessLevelOrder = {
          admin: 1,
          manager: 2,
          user: 3,
        };

        // Sort data by 'accessLevel'
        data.sort(
          (a, b) =>
            accessLevelOrder[a.accessLevel] - accessLevelOrder[b.accessLevel]
        );

        setRows(data);
        setLoading(false);
      } catch (error) {
        setError("Error fetching data: " + error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  return (
    <Box m="20px">
      <Header title="TEAM" subtitle="Managing the Team Members" />
      {loading && <Typography>Loading...</Typography>}
      {error && (
        <Box
          p="20px"
          mb="20px"
          bgcolor={colors.redAccent[700]}
          borderRadius="4px"
        >
          <Typography color={colors.grey[100]}>{error}</Typography>
        </Box>
      )}
      {!loading && !error && (
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
          }}
        >
          <DataGrid checkboxSelection rows={rows} columns={columns} />
        </Box>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {dialogAction === "resetPassword" ? "Reset Password" : ""}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {dialogAction === "resetPassword"
              ? "Are you sure you want to reset the password for this user? A reset email will be sent to the user's email address."
              : ""}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmAction} color="secondary">
            Confirm
          </Button>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={error ? "error" : "success"}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Team;
