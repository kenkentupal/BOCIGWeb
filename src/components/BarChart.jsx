import { useTheme } from "@mui/material";
import { ResponsiveBar } from "@nivo/bar";
import { tokens } from "../theme";
import { useEffect, useState } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import airportList from "../scenes/airportlist"; // Adjust path
import {
  Box,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress, // Import CircularProgress for loading icon
} from "@mui/material";

const BarChart = ({ isDashboard = false }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [data, setData] = useState([]);
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(""); // "" means "All Years"
  const [totalDeclared, setTotalDeclared] = useState(0);
  const [loading, setLoading] = useState(false); // New loading state

  useEffect(() => {
    const fetchAirportArrivals = async () => {
      setLoading(true); // Set loading to true when fetching starts
      const db = getFirestore();
      const arrivalsRef = collection(db, "BaggageInfo");
      const snapshot = await getDocs(arrivalsRef);

      let totalDeclarations = 0;
      const arrivalsData = airportList.map((airport) => {
        let withDeclaration = 0;

        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          const year = new Date(data.dateOfArrival).getFullYear();

          if (selectedYear === "" || year === selectedYear) {
            if (data.airportArrival === airport.code) {
              if (data.declaration === true) {
                withDeclaration += data.arrivalCount || 1;
                totalDeclarations += data.arrivalCount || 1;
              }
            }
          }
        });

        return {
          country: airport.code,
          Declared: withDeclaration,
        };
      });

      setTotalDeclared(totalDeclarations);
      setData(arrivalsData);
      setLoading(false); // Set loading to false once fetching is complete
    };

    fetchAirportArrivals();
  }, [selectedYear]);

  useEffect(() => {
    const fetchYears = async () => {
      const db = getFirestore();
      const arrivalsRef = collection(db, "BaggageInfo");
      const snapshot = await getDocs(arrivalsRef);

      const yearSet = new Set();
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const year = new Date(data.dateOfArrival).getFullYear();
        if (data.declaration === true) {
          yearSet.add(year);
        }
      });

      setYears([...yearSet]);
    };

    fetchYears();
  }, []);

  useEffect(() => {
    if (years.length > 0) {
      setSelectedYear("");
    }
  }, [years]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="250px"
      >
        <CircularProgress color="secondary" /> {/* Loading spinner */}
      </Box>
    );
  }

  if (data.length === 0) {
    return <div>No data available.</div>;
  }

  return (
    <div style={{ height: "250px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px",
          marginLeft: "50px",
          marginRight: "50px",
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight="600" color={colors.grey[100]}>
            All Baggage Declarations
          </Typography>
          <Typography
            variant="h3"
            fontWeight="bold"
            color={colors.greenAccent[500]}
          >
            {totalDeclared}
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap="16px">
          <FormControl variant="outlined" fullWidth>
            <InputLabel>Year</InputLabel>
            <Select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              label="Year"
              style={{ width: "100px" }}
            >
              <MenuItem value="">All Years</MenuItem>
              {years.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </div>
      <ResponsiveBar
        data={data}
        theme={{
          axis: {
            domain: {
              line: {
                stroke: colors.grey[100],
              },
            },
            legend: {
              text: {
                fill: colors.grey[100],
              },
            },
            ticks: {
              line: {
                stroke: colors.grey[100],
                strokeWidth: 1,
              },
              text: {
                fill: colors.grey[100],
              },
            },
          },
          legends: {
            text: {
              fill: colors.grey[100],
            },
          },
        }}
        keys={["Declared"]}
        indexBy="country"
        margin={{ top: 20, right: 130, bottom: 80, left: 60 }}
        padding={0.3}
        valueScale={{ type: "linear" }}
        indexScale={{ type: "band", round: true }}
        colors={{ scheme: "nivo" }}
        borderColor={{
          from: "color",
          modifiers: [["darker", "1.6"]],
        }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: isDashboard ? undefined : "Airport",
          legendPosition: "middle",
          legendOffset: 32,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: isDashboard ? undefined : "Total Arrivals",
          legendPosition: "middle",
          legendOffset: -40,
        }}
        enableLabel={true}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={{
          from: "color",
          modifiers: [["darker", 1.6]],
        }}
        valueFormat=">-.0f"
        legends={[
          {
            dataFrom: "keys",
            anchor: "bottom-right",
            direction: "column",
            justify: false,
            translateX: 120,
            translateY: 0,
            itemsSpacing: 2,
            itemWidth: 100,
            itemHeight: 20,
            itemDirection: "left-to-right",
            itemOpacity: 0.85,
            symbolSize: 20,
            effects: [
              {
                on: "hover",
                style: {
                  itemOpacity: 1,
                },
              },
            ],
          },
        ]}
        role="application"
        barAriaLabel={(e) =>
          `${e.id}: ${Math.round(e.formattedValue)} in airport: ${e.indexValue}`
        }
      />
    </div>
  );
};

export default BarChart;
