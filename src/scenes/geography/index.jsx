import { Box, useTheme } from "@mui/material";
import GeographyChart from "../../components/GeographyChart";
import Header from "../../components/Header";
import { tokens } from "../../theme";

// Define your color mapping for each country here
const countryColorMap = {
  PH: "#FF5733", // Philippines color
  US: "#4CAF50", // Example color for the United States
  CA: "#2196F3", // Example color for Canada
  // Add more countries and their respective colors here
  // ...
};

const Geography = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box m="20px">
      <Header title="Geography" subtitle="Simple Geography Chart" />

      <Box
        height="75vh"
        border={`1px solid ${colors.grey[100]}`}
        borderRadius="4px"
      >
        <GeographyChart countryColorMap={countryColorMap} />
      </Box>
    </Box>
  );
};

export default Geography;
