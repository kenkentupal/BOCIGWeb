import { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { ResponsivePie } from "@nivo/pie";
import { tokens } from "../theme";
import { useTheme } from "@mui/material";

const PieChart = ({ selectedMonth, selectedYear, selectedAirport }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const db = getFirestore();
      const resultTableRef = collection(db, "BaggageInfo");

      // Start building the query
      let q = query(resultTableRef);

      // Apply the year filter if selectedYear is provided and not "All years"
      if (selectedYear && selectedYear !== "All years") {
        q = query(q, where("dateOfArrival", ">=", `${selectedYear}-01-01`));
        q = query(q, where("dateOfArrival", "<=", `${selectedYear}-12-31`));
      }

      // Conditionally apply the month filter if selectedMonth is not "All"
      if (selectedMonth && selectedMonth !== "All") {
        const monthStr =
          selectedMonth < 10 ? `0${selectedMonth}` : selectedMonth;
        q = query(
          q,
          where("dateOfArrival", ">=", `${selectedYear}-${monthStr}-01`),
          where("dateOfArrival", "<=", `${selectedYear}-${monthStr}-31`)
        );
      }

      // Conditionally add the airport filter if selectedAirport is specified
      if (selectedAirport) {
        q = query(q, where("airportArrival", "==", selectedAirport));
      }

      try {
        const querySnapshot = await getDocs(q);
        const nationalityCount = {};

        querySnapshot.forEach((doc) => {
          const nationality = doc.get("nationality");
          if (nationality) {
            nationalityCount[nationality] =
              (nationalityCount[nationality] || 0) + 1;
          }
        });

        const formattedData = Object.keys(nationalityCount).map((key) => ({
          id: key,
          label: `${key} (${nationalityCount[key]})`,
          value: nationalityCount[key],
        }));

        setData(formattedData);
      } catch (error) {
        console.error("Error fetching data from Firestore:", error);
      }
    };

    fetchData();
  }, [selectedMonth, selectedYear, selectedAirport]);

  return (
    <ResponsivePie
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
      }}
      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
      innerRadius={0.5}
      padAngle={0.7}
      cornerRadius={3}
      activeOuterRadiusOffset={8}
      borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
      arcLinkLabelsSkipAngle={10}
      arcLinkLabelsTextColor={colors.grey[100]}
      arcLinkLabelsThickness={2}
      arcLinkLabelsColor={{ from: "color" }}
      enableArcLabels={true}
      arcLabelsRadiusOffset={0.4}
      arcLabelsSkipAngle={7}
      arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
      defs={[
        {
          id: "dots",
          type: "patternDots",
          background: "inherit",
          color: "rgba(255, 255, 255, 0.3)",
          size: 4,
          padding: 1,
          stagger: true,
        },
        {
          id: "lines",
          type: "patternLines",
          background: "inherit",
          color: "rgba(255, 255, 255, 0.3)",
          rotation: -45,
          lineWidth: 6,
          spacing: 10,
        },
      ]}
    />
  );
};

export default PieChart;
