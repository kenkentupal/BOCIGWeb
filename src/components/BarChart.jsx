import { useTheme } from "@mui/material";
import { ResponsiveBar } from "@nivo/bar";
import { tokens } from "../theme";
import { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import airportList from "../scenes/airportlist";
import { Box, Typography, CircularProgress } from "@mui/material";

const BarChart = ({
  isDashboard = false,
  selectedMonth,
  selectedYear,
  selectedAirport,
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [data, setData] = useState([]);
  const [years, setYears] = useState([]);
  const [totalDeclared, setTotalDeclared] = useState(0);
  const [totalNotDeclared, setTotalNotDeclared] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch available years
  useEffect(() => {
    const fetchYears = async () => {
      const db = getFirestore();
      const arrivalsRef = collection(db, "BaggageInfo");
      const snapshot = await getDocs(arrivalsRef);
      const yearSet = new Set();
      snapshot.forEach((doc) => {
        const data = doc.data();
        const year = new Date(data.dateOfArrival).getFullYear();
        yearSet.add(year);
      });
      setYears([...yearSet].sort());
    };

    fetchYears();
  }, []);

  // Fetch airport arrivals based on selected filters
  useEffect(() => {
    const fetchAirportArrivals = async () => {
      setLoading(true);
      const db = getFirestore();
      const arrivalsRef = collection(db, "BaggageInfo");

      // Start building the query based on filters
      let q = query(arrivalsRef);

      // Filter by year if selectedYear is not "All years"
      if (selectedYear && selectedYear !== "All years") {
        q = query(q, where("dateOfArrival", ">=", `${selectedYear}-01-01`));
      }

      // Filter by month if selectedMonth is provided
      if (selectedMonth && selectedMonth !== "All") {
        const monthStr =
          selectedMonth < 10 ? `0${selectedMonth}` : selectedMonth;
        q = query(
          q,
          where("dateOfArrival", ">=", `${selectedYear}-${monthStr}-01`),
          where("dateOfArrival", "<=", `${selectedYear}-${monthStr}-31`)
        );
      }

      // Filter by airport if selectedAirport is provided
      if (selectedAirport) {
        q = query(q, where("airportArrival", "==", selectedAirport));
      }

      // Fetch data from Firestore
      const snapshot = await getDocs(q);
      let totalDeclaredCount = 0;
      let totalNotDeclaredCount = 0;
      const arrivalsData = airportList.map((airport) => {
        let declared = 0;
        let notDeclared = 0;

        snapshot.forEach((doc) => {
          const data = doc.data();
          const year = new Date(data.dateOfArrival).getFullYear();

          // If "All years" is selected, or the document matches the selected year
          if (selectedYear === "All years" || year === parseInt(selectedYear)) {
            if (data.airportArrival === airport.code) {
              if (data.declaration === true) {
                declared += data.arrivalCount || 1;
                totalDeclaredCount += data.arrivalCount || 1;
              } else {
                notDeclared += data.arrivalCount || 1;
                totalNotDeclaredCount += data.arrivalCount || 1;
              }
            }
          }
        });

        return {
          country: airport.code,
          Declared: declared,
          NotDeclared: notDeclared,
        };
      });

      setTotalDeclared(totalDeclaredCount);
      setTotalNotDeclared(totalNotDeclaredCount);
      setData(arrivalsData);
      setLoading(false);
    };

    fetchAirportArrivals();
  }, [selectedMonth, selectedYear, selectedAirport]); // Re-fetch data when any of these values change

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
            Total Travel Frequency
          </Typography>

          <Typography
            variant="h3"
            fontWeight="bold"
            color={colors.greenAccent[500]}
          >
            {totalDeclared + totalNotDeclared}
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap="8px">
          <Typography variant="h6" fontWeight="600" color={colors.grey[100]}>
            Declared:
          </Typography>
          <Typography
            variant="h4"
            fontWeight="bold"
            color={colors.greenAccent[500]}
          >
            {totalDeclared}
          </Typography>

          <Typography variant="h6" fontWeight="600" color={colors.grey[100]}>
            No Declaration:
          </Typography>

          <Typography
            variant="h4"
            fontWeight="bold"
            color={colors.greenAccent[500]}
          >
            {totalNotDeclared}
          </Typography>
        </Box>
      </div>

      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="250px"
        >
          <CircularProgress color="secondary" />
        </Box>
      ) : data.length === 0 ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="250px"
        >
          <Typography variant="h6" color={colors.grey[100]}>
            No data
          </Typography>
        </Box>
      ) : (
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
          keys={["Declared", "NotDeclared"]}
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
            `${e.id}: ${Math.round(e.formattedValue)} in airport: ${
              e.indexValue
            }`
          }
        />
      )}
    </div>
  );
};

export default BarChart;
