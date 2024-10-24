import React, { useEffect, useState } from 'react';
import { Box, Button, IconButton, Typography, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import AirplanemodeActiveIcon from "@mui/icons-material/AirplanemodeActive";
import Header from "../../components/Header";
import StatBox from "../../components/StatBox";
import LineChart from "../../components/LineChart";
import PieChart from "../../components/PieChart";

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalBaggage, setTotalBaggage] = useState(0);


  const [totalNAIABaggage, setTotalNAIABaggage] = useState(0);
  

  useEffect(() => {
    const fetchTotalUsers = async () => {
      const db = getFirestore();
      const passengerCollection = collection(db, 'ResultTable');
      const baggageCollection = collection(db, 'BaggageInfo');
      const baggageSnapshot = await getDocs(baggageCollection);
      setTotalBaggage(baggageSnapshot.size);
      
      // Fetch all passengers
      const usersSnapshot = await getDocs(passengerCollection);
      setTotalUsers(usersSnapshot.size);

      // Fetch baggage data specifically for NAIA arrivals
      const naiaQuery = query(baggageCollection, where('airportArrival', '==', 'NAIA'));
      const NAIAbaggageSnapshot = await getDocs(naiaQuery);
      setTotalNAIABaggage(NAIAbaggageSnapshot.size);




    };

    fetchTotalUsers();
  }, []);

  const pieChartData = [
    {
      "id": "Travelers",
      "label": "Travelers",
      "value": 4500,
      "color": "hsl(102, 70%, 50%)"
    },
    {
      "id": "Non-Travelers",
      "label": "Non-Travelers",
      "value": 3000,
      "color": "hsl(206, 70%, 50%)"
    },
    {
      "id": "Unknown",
      "label": "Unknown",
      "value": 1500,
      "color": "hsl(191, 70%, 50%)"
    }
  ];

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="DASHBOARD" subtitle="Welcome to your dashboard" />
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

      {/* GRID & CHARTS */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="140px"
        gap="20px"
      >
        {/* ROW 1 */}
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={totalNAIABaggage}
            subtitle="NAIA Baggage Arrivals"
            progress={totalNAIABaggage / 10000} // Example progress calculation
            increase="+0%"
            icon={
              <AirplanemodeActiveIcon
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>

        {/* Other StatBoxes */}
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title="0"
            subtitle="CEB"
            progress=""
            increase="+0%"
            icon={
              <AirplanemodeActiveIcon
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>

        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title="0"
            subtitle="CRK"
            progress=""
            increase="+0%"
            icon={
              <AirplanemodeActiveIcon
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>

        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title="0"
            subtitle="DVO"
            progress=""
            increase="+0%"
            icon={
              <AirplanemodeActiveIcon
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>

        {/* ROW 2 */}
        <Box
          gridColumn="span 8"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
        >
          <Box
            mt="25px"
            p="0 30px"
            display="flex "
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography
                variant="h5"
                fontWeight="600"
                color={colors.grey[100]}
              >
                Total Baggage Declarations
              </Typography>
              <Typography
                variant="h3"
                fontWeight="bold"
                color={colors.greenAccent[500]}
              >
                {totalUsers}
              </Typography>
            </Box>
            <Box>
              <IconButton>
                <DownloadOutlinedIcon
                  sx={{ fontSize: "26px", color: colors.greenAccent[500] }}
                />
              </IconButton>
            </Box>
          </Box>
          <Box height="250px" m="-20px 0 0 0">
            <LineChart isDashboard={true} />
          </Box>
        </Box>

        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          overflow="auto"
        >
          <Box
            gridColumn="span 4"
            gridRow="span 2"
            backgroundColor={colors.primary[400]}
            padding="30px"
          >
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
