import { Box } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

const ProgressCircle = ({ riskLevel }) => {
  let IconComponent;
  let color;

  if (riskLevel === "low") {
    IconComponent = CheckCircleIcon; // Green for low risk
    color = "green";
  } else if (riskLevel === "medium") {
    IconComponent = WarningIcon; // Orange for medium risk
    color = "orange";
  } else if (riskLevel === "high") {
    IconComponent = ErrorOutlineIcon; // Red for high risk
    color = "red";
  }

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: 30,
        height: 30,
        borderRadius: "50%",
        backgroundColor: color,
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
      }}
    >
      <IconComponent sx={{ fontSize: 20, color: "white" }} />
    </Box>
  );
};

export default ProgressCircle;
