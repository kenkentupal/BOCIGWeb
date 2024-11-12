import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  useTheme,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import Header from "../../components/Header";
import StatBox from "../../components/StatBox";
import LineChart from "../../components/LineChart";
import PieChart from "../../components/PieChart";
import BarChart from "../../components/BarChart";
import { tokens } from "../../theme";
import airports from "../../scenes/airportlist";

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalBaggage, setTotalBaggage] = useState(0);
  const [totalNAIABaggage, setTotalNAIABaggage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [riskCategories, setRiskCategories] = useState({
    lowRisk: [],
    mediumRisk: [],
    highRisk: [],
  });

  const [selectedAirport, setSelectedAirport] = useState("NAIA"); // Set default airport to NAIA
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // Current month
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Current year

  const [availableYears, setAvailableYears] = useState([]);

  useEffect(() => {
    const db = getFirestore();
    const baggageCollection = collection(db, "BaggageInfo");

    const fetchBaggageData = async () => {
      try {
        const baggageSnapshot = await getDocs(baggageCollection);
        setTotalBaggage(baggageSnapshot.size);

        const NAIAbaggageQuery = query(
          baggageCollection,
          where("airportArrival", "==", "NAIA")
        );
        const NAIADataSnapshot = await getDocs(NAIAbaggageQuery);
        setTotalNAIABaggage(NAIADataSnapshot.size);

        await fetchAvailableYears(db);
        await fetchMonthlyRiskScores(db);
      } catch (error) {
        console.error("Error fetching data from Firestore:", error);
      }
    };

    const fetchAvailableYears = async (db) => {
      const baggageSnapshot = await getDocs(collection(db, "BaggageInfo"));
      const yearsSet = new Set();
      baggageSnapshot.forEach((doc) => {
        const { dateOfArrival } = doc.data();
        if (dateOfArrival) {
          const arrivalDate = new Date(
            dateOfArrival.includes("/")
              ? dateOfArrival.split("/").reverse().join("-")
              : dateOfArrival
          );
          if (!isNaN(arrivalDate.getTime())) {
            yearsSet.add(arrivalDate.getFullYear());
          }
        }
      });
      setAvailableYears(["All years", ...Array.from(yearsSet).sort()]);
    };

    const fetchMonthlyRiskScores = async (db) => {
      const baggageSnapshot = await getDocs(collection(db, "BaggageInfo"));
      if (baggageSnapshot.empty) return;

      const riskScoresByPassport = {};
      baggageSnapshot.forEach((doc) => {
        const { passportNumber, riskScore, dateOfArrival, airportArrival } =
          doc.data();
        if (
          !passportNumber ||
          !riskScore ||
          riskScore <= 0 ||
          !dateOfArrival ||
          (selectedAirport && airportArrival !== selectedAirport)
        )
          return;

        const arrivalDate = new Date(
          dateOfArrival.includes("/")
            ? dateOfArrival.split("/").reverse().join("-")
            : dateOfArrival
        );

        if (isNaN(arrivalDate.getTime())) return;

        const monthMatches =
          selectedMonth === null ||
          arrivalDate.getMonth() + 1 === selectedMonth;
        const yearMatches =
          selectedYear === "All years" ||
          arrivalDate.getFullYear() === selectedYear;

        if (monthMatches && yearMatches) {
          riskScoresByPassport[passportNumber] =
            (riskScoresByPassport[passportNumber] || 0) + riskScore;
        }
      });

      const categorizedRisks = { lowRisk: [], mediumRisk: [], highRisk: [] };
      Object.entries(riskScoresByPassport).forEach(
        ([passportNumber, totalRiskScore]) => {
          if (totalRiskScore >= 75)
            categorizedRisks.highRisk.push({ passportNumber, totalRiskScore });
          else if (totalRiskScore >= 50)
            categorizedRisks.mediumRisk.push({
              passportNumber,
              totalRiskScore,
            });
          else
            categorizedRisks.lowRisk.push({ passportNumber, totalRiskScore });
        }
      );

      setRiskCategories(categorizedRisks);
    };

    fetchBaggageData();
  }, [selectedAirport, selectedMonth, selectedYear]);

  const statData = [
    {
      title: "Low Risk",
      subtitle: riskCategories.lowRisk.length,
      riskLevel: "low",
    },
    {
      title: "Medium Risk",
      subtitle: riskCategories.mediumRisk.length,
      riskLevel: "medium",
    },
    {
      title: "High Risk",
      subtitle: riskCategories.highRisk.length,
      riskLevel: "high",
    },
  ];

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="DASHBOARD" subtitle="Baggage Declarations" />
        <Button
          sx={{
            backgroundColor: colors.blueAccent[700],
            color: colors.grey[100],
            fontSize: "14px",
            fontWeight: "bold",
            padding: "10px 20px",
          }}
        >
          <DownloadOutlinedIcon sx={{ mr: "10px" }} /> Download Reports
        </Button>
      </Box>

      <Box display="flex" gap="20px" mb="20px">
        <FormControl variant="outlined" sx={{ width: "150px" }}>
          <InputLabel>Airport</InputLabel>
          <Select
            value={selectedAirport}
            onChange={(e) => setSelectedAirport(e.target.value)}
            label="Airport"
          >
            <MenuItem value="">All Airports</MenuItem>
            {airports.map((airport) => (
              <MenuItem key={airport.code} value={airport.code}>
                {airport.code}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl variant="outlined" sx={{ width: "150px" }}>
          <InputLabel>Month</InputLabel>
          <Select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            label="Month"
          >
            <MenuItem value={null}>All Months</MenuItem>
            {Array.from({ length: 12 }, (_, i) => (
              <MenuItem key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString("default", { month: "long" })}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl variant="outlined" sx={{ width: "150px" }}>
          <InputLabel>Year</InputLabel>
          <Select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            label="Year"
          >
            {availableYears.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
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
            gridColumn={`span ${12 / statData.length}`}
            backgroundColor={colors.primary[400]}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <StatBox
              title={stat.title}
              subtitle={stat.subtitle}
              riskLevel={stat.riskLevel}
            />
          </Box>
        ))}
        <Box
          gridColumn="span 8"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
        >
          <Box height="250px" m="20px 0">
            <BarChart
              isDashboard={true}
              selectedAirport={selectedAirport}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
            />
          </Box>
        </Box>
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          overflow="auto"
        >
          <Box height="250px" m="20px 0">
            <PieChart
              isDashboard={true}
              selectedAirport={selectedAirport}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
