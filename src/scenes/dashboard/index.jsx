import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  useTheme,
} from "@mui/material";
import { tokens } from "../../theme";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import AirplanemodeActiveIcon from "@mui/icons-material/AirplanemodeActive";
import Header from "../../components/Header";
import StatBox from "../../components/StatBox";
import LineChart from "../../components/LineChart";
import PieChart from "../../components/PieChart";
import BarChart from "../../components/BarChart";

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalBaggage, setTotalBaggage] = useState(0);
  const [totalNAIABaggage, setTotalNAIABaggage] = useState(0);
  const [loading, setLoading] = useState(true); // New loading state

  useEffect(() => {
    const fetchTotalUsers = async () => {
      console.log("Fetching total users...");
      setLoading(true); // Set loading to true before fetching
      const db = getFirestore();
      const passengerCollection = collection(db, "ResultTable");
      const baggageCollection = collection(db, "BaggageInfo");

      try {
        const baggageSnapshot = await getDocs(baggageCollection);
        setTotalBaggage(baggageSnapshot.size);

        const usersSnapshot = await getDocs(passengerCollection);
        setTotalUsers(usersSnapshot.size);

        const naiaQuery = query(
          baggageCollection,
          where("airportArrival", "==", "NAIA")
        );
        const NAIAbaggageSnapshot = await getDocs(naiaQuery);
        setTotalNAIABaggage(NAIAbaggageSnapshot.size);
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchTotalUsers();
  }, []);

  const pieChartData = [
    {
      id: "Travelers",
      label: "Travelers",
      value: 4500,
      color: "hsl(102, 70%, 50%)",
    },
    {
      id: "Non-Travelers",
      label: "Non-Travelers",
      value: 3000,
      color: "hsl(206, 70%, 50%)",
    },
    {
      id: "Unknown",
      label: "Unknown",
      value: 1500,
      color: "hsl(191, 70%, 50%)",
    },
  ];

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress
          color={theme.palette.mode === "dark" ? "inherit" : "primary"}
        />
      </Box>
    );
  }

  const statData = [
    {
      title: "Low Risk",
      subtitle: 123,
      progress: 123,
    },
    {
      title: "Medium Risk",
      subtitle: 123,
      progress: 123,
    },
    {
      title: "High Risk",
      subtitle: 123,
      progress: 123,
    },
  ];

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="DASHBOARD" subtitle="Baggage Declarations" />
        <Box>
          <Button
            sx={{
              backgroundColor: colors.blueAccent[700],
              color: colors.grey[100],
              fontSize: "14px",
              fontWeight: "bold",
              padding: "10px 20px",
            }}
          >
            <DownloadOutlinedIcon sx={{ mr: "10px" }} />
            Download Reports
          </Button>
        </Box>
      </Box>

      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="140px"
        gap="20px"
      >
        {statData.map((stat, index) => (
          <Box
            key={index}
            gridColumn={`span ${Math.floor(12 / statData.length)}`} // Adjust to divide the total columns by the number of items
            backgroundColor={colors.primary[400]}
            display="flex"
            alignItems="center"
            justifyContent="center"
            width="100%" // Ensure the box takes the full width of its column
          >
            <StatBox
              title={stat.title}
              subtitle={stat.subtitle}
              progress={stat.progress}
              increase="+0%"
            />
          </Box>
        ))}

        <Box
          gridColumn="span 12"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
        >
          <Box height="250px" m="20px 0 0 0">
            <BarChart isDashboard={true} />
          </Box>
        </Box>

        <Box
          gridColumn="span 8"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
        >
          <Box height="250px" m="20px 0 0 0">
            <LineChart isDashboard={true} />
          </Box>
        </Box>

        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          overflow="auto"
        >
          <Box padding="30px">
            <Typography
              variant="h5"
              fontWeight="600"
              sx={{ marginBottom: "15px" }}
            >
              Nationalities
            </Typography>
            <Box height="200px">
              <PieChart data={pieChartData} />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
