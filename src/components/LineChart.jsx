import { ResponsiveLine } from "@nivo/line";
import {
  Box,
  Typography,
  useTheme,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
} from "@mui/material";
import { tokens } from "../theme";
import { useState, useEffect } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import airports from "../scenes/airportlist"; // Adjust path

const db = getFirestore();

const LineChart = ({ isCustomLineColors = false, isDashboard = false }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [totalBaggage, setTotalBaggage] = useState(0);
  const [data, setData] = useState([
    {
      id: "Total",
      color: "hsl(200, 70%, 50%)",
      data: Array.from({ length: 12 }, (_, i) => ({
        x: new Date(0, i).toLocaleString("default", { month: "short" }),
        y: 0,
      })),
    },
  ]);
  const [selectedAirport, setSelectedAirport] = useState(""); // Default to all airports
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("All"); // Default to "All"
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const baggageInfoRef = collection(db, "BaggageInfo");
      const querySnapshot = await getDocs(baggageInfoRef);

      const uniqueYears = new Set();

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const date = data.dateOfArrival;

        if (date) {
          const year = new Date(date).getFullYear();
          uniqueYears.add(year);
        }
      });

      // Set years and default selectedYear
      const sortedYears = Array.from(uniqueYears).sort();
      setYears(["All", ...sortedYears]); // Prepend "All" to the list
      setLoading(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const baggageInfoRef = collection(db, "BaggageInfo");
      const querySnapshot = await getDocs(baggageInfoRef);

      const monthCounts = Array.from({ length: 12 }, (_, i) => ({
        x: new Date(0, i).toLocaleString("default", { month: "short" }),
        y: 0,
      }));
      let baggageCountForAirport = 0;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const date = data.dateOfArrival;
        const arrivalAirport = data.airportArrival;

        if (date) {
          const dateObj = new Date(date);
          const year = dateObj.getFullYear();

          // Check if "All" is selected
          if (selectedYear === "All" || year === parseInt(selectedYear)) {
            // Count for the selected airport or all airports
            if (selectedAirport === "" || selectedAirport === arrivalAirport) {
              baggageCountForAirport++;
              const month = dateObj.toLocaleString("default", {
                month: "short",
              });
              const monthIndex = monthCounts.findIndex((m) => m.x === month);

              if (monthIndex >= 0) {
                monthCounts[monthIndex].y++;
              }
            }
          }
        }
      });

      setTotalBaggage(baggageCountForAirport);
      setData([
        { id: "Total", color: "hsl(200, 70%, 50%)", data: monthCounts },
      ]);
      setLoading(false);
    };

    fetchData();
  }, [selectedAirport, selectedYear]);

  return (
    <div
      style={{
        height: "200px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          marginBottom: "16px",
          padding: "0 50px",
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
            {totalBaggage}
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap="16px">
          <FormControl
            variant="outlined"
            margin="dense"
            style={{ width: "120px" }}
          >
            <InputLabel>
              {selectedAirport === "" ? "All Airports" : "Airport"}
            </InputLabel>{" "}
            {/* Updated to show "All Airports" when selected is empty */}
            <Select
              value={selectedAirport}
              onChange={(e) => setSelectedAirport(e.target.value)}
              label="Airport"
            >
              <MenuItem value="">All Airports</MenuItem>{" "}
              {/* Changed to "All Airports" */}
              {airports.map((airport) => (
                <MenuItem key={airport.code} value={airport.code}>
                  {airport.code}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl
            variant="outlined"
            margin="dense"
            style={{ width: "100px" }}
          >
            <InputLabel>
              {selectedYear === "All" ? "All Years" : "Year"}
            </InputLabel>{" "}
            {/* Show "All Years" if selected is "All" */}
            <Select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              label="Year"
            >
              {years.length > 0 ? (
                years.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No years available</MenuItem>
              )}
            </Select>
          </FormControl>
        </Box>
      </div>

      {loading ? (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="100%"
        >
          <CircularProgress color="secondary" />
        </Box>
      ) : (
        <ResponsiveLine
          data={data}
          theme={{
            axis: {
              domain: { line: { stroke: colors.grey[100] } },
              legend: { text: { fill: colors.grey[100] } },
              ticks: {
                line: { stroke: colors.grey[100], strokeWidth: 1 },
                text: { fill: colors.grey[100] },
              },
            },
            legends: { text: { fill: colors.grey[100] } },
            tooltip: { container: { color: colors.primary[500] } },
          }}
          colors={isCustomLineColors ? { datum: "color" } : { scheme: "nivo" }}
          margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
          xScale={{ type: "point" }}
          yScale={{
            type: "linear",
            min: "auto",
            max: "auto",
            stacked: false,
            reverse: false,
          }}
          yFormat=" >-.2f"
          curve="catmullRom"
          axisTop={null}
          axisRight={null}
          axisBottom={{
            orient: "bottom",
            tickSize: 0,
            tickPadding: 5,
            tickRotation: 0,
            legend: isDashboard ? undefined : "Month",
            legendOffset: 36,
            legendPosition: "middle",
          }}
          axisLeft={{
            orient: "left",
            tickValues: 5,
            tickSize: 3,
            tickPadding: 5,
            tickRotation: 0,
            legend: isDashboard ? undefined : "Total",
            legendOffset: -40,
            legendPosition: "middle",
          }}
          enableGridX={false}
          enableGridY={false}
          pointSize={8}
          pointColor={{ theme: "background" }}
          pointBorderWidth={2}
          pointBorderColor={{ from: "serieColor" }}
          pointLabelYOffset={-12}
          useMesh={true}
          legends={[
            {
              anchor: "bottom-right",
              direction: "column",
              justify: false,
              translateX: 100,
              translateY: 0,
              itemsSpacing: 0,
              itemDirection: "left-to-right",
              itemWidth: 80,
              itemHeight: 20,
              itemOpacity: 0.75,
              symbolSize: 12,
              symbolShape: "circle",
              symbolBorderColor: "rgba(0, 0, 0, .5)",
              effects: [
                {
                  on: "hover",
                  style: {
                    itemBackground: "rgba(0, 0, 0, .03)",
                    itemOpacity: 1,
                  },
                },
              ],
            },
          ]}
        />
      )}
    </div>
  );
};

export default LineChart;
