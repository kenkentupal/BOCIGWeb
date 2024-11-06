import { useState, useEffect } from "react";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import {
  Box,
  IconButton,
  Typography,
  CircularProgress,
  useTheme,
} from "@mui/material";
import { Link } from "react-router-dom";
import "react-pro-sidebar/dist/css/styles.css";
import { tokens } from "../../theme";
import { auth, db } from "../../Firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import ContactsOutlinedIcon from "@mui/icons-material/ContactsOutlined";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import PieChartOutlineOutlinedIcon from "@mui/icons-material/PieChartOutlineOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import LocalAirportOutlinedIcon from "@mui/icons-material/LocalAirportOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import ShowChartIcon from "@mui/icons-material/ShowChart";

const Item = ({ title, to, icon, selected, setSelected }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <MenuItem
      active={selected === title}
      style={{
        color: colors.grey[100],
      }}
      onClick={() => setSelected(title)}
      icon={icon}
    >
      <Typography>{title}</Typography>
      <Link to={to} />
    </MenuItem>
  );
};

const Sidebar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState("Dashboard");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userUID, setUserUID] = useState("");
  const [userAccessLevel, setUserAccessLevel] = useState("");
  const [error, setError] = useState("");
  const [sessionLoading, setSessionLoading] = useState(true); // Track session loading status

  useEffect(() => {
    const fetchUserData = async (uid) => {
      try {
        const userDocRef = doc(db, "Users", uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const id = userData.id || "";
          const accessLevel = userData.accessLevel || "";
          setUserName(` ${id}`);
          setUserAccessLevel(accessLevel);
          setError("");
        } else {
          setUserName("User not found");
          setError("No such user document!");
        }
      } catch (error) {
        setUserName("Error loading user data");
        setError(`Error fetching user data: ${error.message}`);
      } finally {
        setSessionLoading(false); // Stop loading when user data is fetched
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
        setUserUID(user.uid);
        fetchUserData(user.uid);
      } else {
        setSessionLoading(false); // Stop loading if no user is logged in
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <Box
      sx={{
        "& .pro-sidebar-inner": {
          background: `${colors.primary[400]} !important`,
        },
        "& .pro-icon-wrapper": {
          backgroundColor: "transparent !important",
        },
        "& .pro-inner-item": {
          padding: "5px 35px 5px 20px !important",
        },
        "& .pro-inner-item:hover": {
          color: "#868dfb !important",
        },
        "& .pro-menu-item.active": {
          color: "#6870fa !important",
        },
      }}
    >
      <ProSidebar collapsed={isCollapsed}>
        <Menu iconShape="square">
          {/* LOGO AND MENU ICON */}
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{
              margin: "10px 0 20px 0",
              color: colors.grey[100],
            }}
          >
            {!isCollapsed && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                ml="15px"
              >
                <Typography variant="h3" color={colors.grey[100]}>
                  {/* Your Logo Here */}
                </Typography>
                <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          {!isCollapsed && (
            <Box mb="25px">
              <Box display="flex" justifyContent="center" alignItems="center">
                <img
                  alt="profile-user"
                  width="100px"
                  height="100px"
                  src={`../../assets/ciis.png`}
                  style={{ cursor: "pointer", borderRadius: "50%" }}
                />
              </Box>
              <Box textAlign="center">
                <Typography
                  variant="h3"
                  color={colors.grey[100]}
                  fontWeight="bold"
                  sx={{ m: "10px 0 0 0" }}
                >
                  {userName}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Display loading spinner in sidebar until session is ready */}
          {sessionLoading ? (
            <Box display="flex" justifyContent="center" mt={4}>
              <CircularProgress color="inherit" />
            </Box>
          ) : (
            <Box paddingLeft={isCollapsed ? undefined : "10%"}>
              <Item
                title="Dashboard"
                to="/"
                icon={<HomeOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
              />
              <Item
                title="Analysis"
                to="/analysis"
                icon={<ShowChartIcon />}
                selected={selected}
                setSelected={setSelected}
              />

              <Typography
                variant="h6"
                color={colors.grey[300]}
                sx={{ m: "15px 0 5px 20px" }}
              >
                Data
              </Typography>

              {userAccessLevel !== "examiner" && (
                <Item
                  title="Airliner"
                  to="/search"
                  icon={<LocalAirportOutlinedIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />
              )}

              {userAccessLevel !== "airliner" && (
                <Item
                  title="Examiner"
                  to="/examiner"
                  icon={
                    <Box display="flex" alignItems="center">
                      <PersonOutlinedIcon />
                      <LockOutlinedIcon
                        style={{ marginLeft: -8, fontSize: 16 }}
                      />
                    </Box>
                  }
                  selected={selected}
                  setSelected={setSelected}
                />
              )}
              {userAccessLevel !== "airliner" &&
                userAccessLevel !== "examiner" && (
                  <Item
                    title="History"
                    to="/contacts"
                    icon={<ContactsOutlinedIcon />}
                    selected={selected}
                    setSelected={setSelected}
                  />
                )}
              {userAccessLevel !== "airliner" &&
                userAccessLevel !== "examiner" && (
                  <Typography
                    variant="h6"
                    color={colors.grey[300]}
                    sx={{ m: "15px 0 5px 20px" }}
                  >
                    Admin
                  </Typography>
                )}

              {userAccessLevel !== "airliner" &&
                userAccessLevel !== "examiner" && (
                  <Item
                    title="Manage Team"
                    to="/team"
                    icon={<PeopleOutlinedIcon />}
                    selected={selected}
                    setSelected={setSelected}
                  />
                )}

              {userAccessLevel !== "airliner" &&
                userAccessLevel !== "examiner" && (
                  <Item
                    title="Passenger"
                    to="/passenger"
                    icon={<PeopleOutlinedIcon />}
                    selected={selected}
                    setSelected={setSelected}
                  />
                )}

              {userAccessLevel !== "airliner" &&
                userAccessLevel !== "examiner" && (
                  <Item
                    title="Profile Form"
                    to="/form"
                    icon={<PersonOutlinedIcon />}
                    selected={selected}
                    setSelected={setSelected}
                  />
                )}

              <Typography
                variant="h6"
                color={colors.grey[300]}
                sx={{ m: "15px 0 5px 20px" }}
              >
                Pages
              </Typography>

              <Item
                title="Calendar"
                to="/calendar"
                icon={<CalendarTodayOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
              />
              <Item
                title="FAQ Page"
                to="/faq"
                icon={<HelpOutlineOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
              />

              <Typography
                variant="h6"
                color={colors.grey[300]}
                sx={{ m: "15px 0 5px 20px" }}
              >
                Charts
              </Typography>
              <Item
                title="Bar Chart"
                to="/bar"
                icon={<BarChartOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
              />
              <Item
                title="Pie Chart"
                to="/pie"
                icon={<PieChartOutlineOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
              />
              <Item
                title="Line Chart"
                to="/line"
                icon={<TimelineOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
              />
              <Item
                title="Geography Chart"
                to="/geography"
                icon={<MapOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
              />
            </Box>
          )}
        </Menu>
      </ProSidebar>
    </Box>
  );
};

export default Sidebar;
