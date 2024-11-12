import { useEffect, useState } from "react";
import {
  Box,
  Modal,
  IconButton,
  Typography,
  TextField,
  Button,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Menu,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import {
  collection,
  onSnapshot,
  setDoc,
  getDocs,
  doc,
} from "firebase/firestore"; // Changed getDocs to onSnapshot
import { getStorage } from "firebase/storage";
import { db } from "../../Firebase";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import RefreshIcon from "@mui/icons-material/Refresh";
import ViewBaggage from "./ViewBaggage";
import SearchIcon from "@mui/icons-material/Search";
import { CircularProgress } from "@mui/material";
import { Select, InputLabel, FormControl } from "@mui/material";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord"; // Circle Icon

const Contacts = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const storage = getStorage();

  const [openBaggageList, setOpenBaggageList] = useState(false);
  const [selectedPassportNumber, setSelectedPassportNumber] = useState("");

  const [loading, setLoading] = useState(true);
  const [yearsAndMonths, setYearsAndMonths] = useState([]);

  const columns = createColumns(setAnchorEl, setSelectedPassportNumber);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // Default to current month
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Default to current year
  const [monthsAndYears, setMonthsAndYears] = useState([]);

  useEffect(() => {
    const fetchMonths = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "BaggageInfo"));
        const monthsSet = new Set();
        const yearsSet = new Set();

        querySnapshot.forEach((doc) => {
          const dateOfArrival = doc.data().dateOfArrival;
          const [year, month] = dateOfArrival.split("-"); // Extract year and month

          monthsSet.add(month); // Add only the month to the set
          yearsSet.add(year); // Add only the year to the set
        });

        // Convert the Sets to arrays and sort by month and year
        const sortedMonths = Array.from(monthsSet).sort((a, b) => a - b);
        const sortedYears = Array.from(yearsSet).sort((a, b) => a - b);

        setMonthsAndYears(sortedMonths); // Set months
        setYearsAndMonths(sortedYears); // Set years
        if (sortedMonths.length > 0) {
          setSelectedMonth(parseInt(sortedMonths[sortedMonths.length - 1])); // Default to the most recent month
        }
        if (sortedYears.length > 0) {
          setSelectedYear(parseInt(sortedYears[sortedYears.length - 1])); // Default to the most recent year
        }
      } catch (error) {
        console.error("Error fetching BaggageInfo data:", error);
      }
    };

    fetchMonths();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "ResultTable"));
        const fetchedData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const updatedData = await Promise.all(
          fetchedData.map(async (item) => {
            const passportNumber = item.passportNumber;

            const baggageQuerySnapshot = await getDocs(
              collection(db, "BaggageInfo")
            );
            const baggageData = baggageQuerySnapshot.docs
              .map((doc) => doc.data())
              .filter(
                (baggage) =>
                  baggage.passportNumber === passportNumber &&
                  parseInt(baggage.dateOfArrival.split("-")[1]) ===
                    selectedMonth &&
                  parseInt(baggage.dateOfArrival.split("-")[0]) === selectedYear
              );

            const totalRiskScore = baggageData.reduce((total, baggage) => {
              return total + (baggage.riskScore || 0);
            }, 0);

            return {
              ...item,
              totalRiskScore,
            };
          })
        );

        // Sort by totalRiskScore from highest to lowest
        const sortedData = updatedData.sort(
          (a, b) => b.totalRiskScore - a.totalRiskScore
        );

        setData(sortedData);
        setFilteredData(sortedData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching Firestore data: ", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedMonth, selectedYear]); // Include selectedYear as a dependency

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleViewBaggage = () => {
    console.log("Selected Passport Number:", selectedPassportNumber); // Log the selected passport number
    setOpenBaggageList(true); // Open the AddBaggage modal
    setAnchorEl(null); // Close the menu
  };

  const handleSearch = () => {
    const filtered = data.filter((item) =>
      String(item["passportNumber"] || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
    setFilteredData(filtered);
    // If no results found, set passengerNotFound to true
  };

  const handleReload = () => {
    setSearchQuery("");
    setFilteredData(data); // Reset filtered data to show all
  };

  // Rest of your component...
  return (
    <Box m="20px">
      <Header
        title="Passenger Information"
        subtitle="List of Passenger Information"
      />
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
        handleReload={handleReload}
        theme={theme}
        colors={colors}
        passengerNotFound={false} // Add any condition for passenger not found
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        monthsAndYears={monthsAndYears}
        yearsAndMonths={yearsAndMonths}
      />

      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="75vh"
        >
          <CircularProgress />
        </Box>
      ) : (
        <DataGridContainer
          filteredData={filteredData}
          colors={colors}
          columns={columns}
        />
      )}

      <ViewBaggage
        open={openBaggageList}
        onClose={() => setOpenBaggageList(false)}
        passportNumber={selectedPassportNumber}
      />
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={handleViewBaggage}>
          View Baggage Declaration
        </MenuItem>
      </Menu>
    </Box>
  );
};

const createColumns = (setAnchorEl, setSelectedPassportNumber) => [
  { field: "id", headerName: "ID", flex: 0.5 },
  { field: "firstName", headerName: "First Name", flex: 1 },
  { field: "middleName", headerName: "Middle Name", flex: 1 },
  { field: "lastName", headerName: "Last Name", flex: 1 },
  { field: "gender", headerName: "Gender", flex: 0.5 },
  { field: "dateOfBirth", headerName: "Date of Birth", flex: 0.5 },
  { field: "nationality", headerName: "Nationality", flex: 0.5 },
  { field: "placeIssued", headerName: "Place Issued", flex: 0.5 },
  { field: "occupation", headerName: "Occupation", flex: 1 },

  {
    field: "totalRiskScore",
    headerName: "Risk",
    flex: 0.5,
    renderCell: (params) => {
      const score = params.row.totalRiskScore;
      let iconColor = "";

      // Only display the icon if the score is greater than 0
      if (score > 0) {
        if (score >= 75) {
          iconColor = "red"; // High Risk
        } else if (score >= 50) {
          iconColor = "orange"; // Medium Risk
        } else {
          iconColor = "green"; // Low Risk
        }

        return (
          <Box
            display="flex"
            justifyContent="left"
            alignItems="center"
            sx={{ height: "100%" }} // Ensure the container takes full height
          >
            <FiberManualRecordIcon style={{ color: iconColor, fontSize: 20 }} />
          </Box>
        );
      }

      // If score is 0, don't render anything
      return null;
    },
  },

  {
    field: "actions",
    headerName: "",
    flex: 1,
    renderCell: (params) => (
      <IconButton
        onClick={(event) => {
          setSelectedPassportNumber(params.row["passportNumber"]); // Set the selected passport number
          setAnchorEl(event.currentTarget);
        }}
      >
        <MoreVertIcon />
      </IconButton>
    ),
  },
];

const SearchBar = ({
  searchQuery,
  setSearchQuery,
  handleSearch,
  handleReload,
  theme,
  colors,
  passengerNotFound,
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  monthsAndYears,
  yearsAndMonths,
}) => (
  <Box width="50%" mx="auto" mb={2}>
    <Box display="flex" alignItems="center">
      <TextField
        label="Search by Passport Number"
        variant="outlined"
        placeholder="Enter Passport Number"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        fullWidth
        error={passengerNotFound} // Highlight textbox in red if passenger not found
        helperText={passengerNotFound ? "Passenger not found" : ""}
        InputProps={{
          style: {
            backgroundColor:
              theme.palette.mode === "dark" ? colors.primary[500] : "#fff",
            color: theme.palette.mode === "dark" ? colors.grey[100] : "#000",
            borderRadius: "5px",
          },
        }}
        InputLabelProps={{
          style: {
            color:
              theme.palette.mode === "dark"
                ? colors.grey[300]
                : colors.grey[800],
          },
        }}
      />
      <IconButton onClick={handleSearch}>
        <SearchIcon />
      </IconButton>
      <IconButton onClick={handleReload}>
        <RefreshIcon />
      </IconButton>
      <FormControl variant="outlined" sx={{ marginLeft: 2, minWidth: 120 }}>
        <InputLabel>Month</InputLabel>
        <Select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          label="Month"
        >
          {monthsAndYears.map((month, index) => (
            <MenuItem key={index} value={parseInt(month)}>
              {new Date(0, month - 1).toLocaleString("default", {
                month: "long",
              })}{" "}
              {/* Display month name */}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl variant="outlined" sx={{ marginLeft: 2, minWidth: 120 }}>
        <InputLabel>Year</InputLabel>
        <Select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          label="Year"
        >
          {yearsAndMonths.map((year, index) => (
            <MenuItem key={index} value={parseInt(year)}>
              {year}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  </Box>
);

const DataGridContainer = ({ filteredData, colors, columns }) => (
  <Box
    m="40px 0 0 0"
    height="75vh"
    sx={{
      "& .MuiDataGrid-root": { border: "none" },
      "& .MuiDataGrid-cell": { borderBottom: "none" },
      "& .name-column--cell": { color: colors.greenAccent[300] },
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
      "& .MuiCheckbox-root": { color: `${colors.greenAccent[200]} !important` },
      "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
        color: `${colors.grey[100]} !important`,
      },
    }}
  >
    <DataGrid
      rows={filteredData}
      columns={columns}
      components={{ Toolbar: GridToolbar }}
    />
  </Box>
);

const ConfirmationDialog = ({ open, setOpen, handleConfirm }) => (
  <Dialog open={open} onClose={() => setOpen(false)}>
    <DialogTitle>Confirmation</DialogTitle>
    <DialogContent>
      <Typography>Passenger not found.</Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={() => setOpen(false)}>Confirm</Button>
    </DialogActions>
  </Dialog>
);

export default Contacts;
