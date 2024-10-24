import { ResponsiveLine } from "@nivo/line";
import { useTheme } from "@mui/material";
import { tokens } from "../theme";
import { useState, useEffect } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";

// Firestore initialization
const db = getFirestore();

const LineChart = ({ isCustomLineColors = false, isDashboard = false }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [data, setData] = useState([
    {
      id: "Total",
      color: "hsl(200, 70%, 50%)",
      data: [
        { x: "Jan", y: 0 },
        { x: "Feb", y: 0 },
        { x: "Mar", y: 0 },
        { x: "Apr", y: 0 },
        { x: "May", y: 0 },
        { x: "Jun", y: 0 },
        { x: "Jul", y: 0 },
        { x: "Aug", y: 0 },
        { x: "Sep", y: 0 },
        { x: "Oct", y: 0 },
        { x: "Nov", y: 0 },
        { x: "Dec", y: 0 },
      ],
    },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      const baggageInfoRef = collection(db, "BaggageInfo");
      const querySnapshot = await getDocs(baggageInfoRef);

      // Initialize month counts
      const monthCounts = {
        Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0, Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0,
      };

      // Process each document
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const date = data.dateOfArrival; // assuming the date field is named "Date"
        const arrivalAirport = data.airportArrival; // assuming the arrival airport field is named "ArrivalAirport"
        if (date && arrivalAirport) {
          const month = new Date(date).toLocaleString("default", { month: "short" });
          if (monthCounts.hasOwnProperty(month)) {
            monthCounts[month]++;
          }
        }
      });

      // Convert monthCounts to array format
      const totalData = Object.keys(monthCounts).map((month) => ({
        x: month,
        y: monthCounts[month],
      }));

      // Update the chart data
      setData((prevData) => {
        const updatedData = prevData.map((serie) =>
          serie.id === "Total" ? { ...serie, data: totalData } : serie
        );
        return updatedData;
      });
    };

    fetchData();
  }, []);

  return (
    <ResponsiveLine
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
        tooltip: {
          container: {
            color: colors.primary[500],
          },
        },
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
  );
};

export default LineChart;
