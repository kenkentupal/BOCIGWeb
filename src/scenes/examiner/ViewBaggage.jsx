import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  IconButton,
} from '@mui/material';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage'; // Import Firebase storage functions
import CloseIcon from '@mui/icons-material/Close';
import ImageIcon from '@mui/icons-material/Image';
import { tokens } from "../../theme";
import { useTheme } from '@mui/material/styles';

const ViewBaggage = ({ open, onClose, passportNumber }) => {
  const [baggageInfo, setBaggageInfo] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null); // State for the selected image
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  useEffect(() => {
    const fetchBaggageInfo = async () => {
      const db = getFirestore();
      const baggageCollection = collection(db, 'BaggageInfo');
      const baggageSnapshot = await getDocs(baggageCollection);
      const baggageList = baggageSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBaggageInfo(baggageList);
    };

    fetchBaggageInfo();
  }, []);

  // Filter baggage info by the passed passportNumber
  const filteredBaggageInfo = baggageInfo.filter((baggage) => baggage.passportNumber === passportNumber);

  const handleImageClick = async (baggage) => {
    const storage = getStorage(); // Initialize Storage
    const waitImageRef = ref(storage, `FaceImages/${baggage.airportArrival}/${baggage.airportArrival}wait/${baggage.passportNumber}${baggage.dateOfArrival}.png`);
    const doneImageRef = ref(storage, `FaceImages/${baggage.airportArrival}/${baggage.airportArrival}done/${baggage.passportNumber}${baggage.dateOfArrival}.png`);
  
    try {
      const url = await getDownloadURL(waitImageRef);
      setSelectedImage(url);
    } catch (error) {
      console.log("Wait image not found, trying done image...");
      try {
        const url = await getDownloadURL(doneImageRef);
        setSelectedImage(url);
      } catch (error) {
        console.error("Error fetching both images:", error);
        setSelectedImage(null);
      }
    }
  };

  const handleCloseImage = () => {
    setSelectedImage(null);
  };
  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="lg"
        PaperProps={{
          style: {
            width: '100%',
            maxWidth: 'none',
            backgroundColor: colors.primary[400],
          },
        }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" color={colors.grey[100]}>
              View Baggage Information
            </Typography>
            <IconButton edge="end" color="inherit" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <TableContainer component={Paper} sx={{ backgroundColor: colors.primary[500] }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {[
                    "Passport Number",
                    "Date of Last Departure",
                    "Country of Origin",
                    "Date of Arrival",
                    "Flight or Vessel",
                    "Airport Arrival",
                    "Family Members (Below 18)",
                    "Family Members (Above 18)",
                    "Checked-in Baggage",
                    "Hand-Carried Baggage",
                    "Traveler Type",
                    "Purpose of Travel",
                    "Goods Value",
                    "Peso/Dollar Value",
                    "Bringing Items",
                    "Image"
                  ].map((header) => (
                    <TableCell
                      key={header}
                      align="center"
                      style={{
                        fontWeight: 'bold',
                        backgroundColor: colors.blueAccent[700],
                        color: colors.grey[100],
                      }}
                    >
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
             <TableBody>
  {filteredBaggageInfo.length > 0 ? (
    filteredBaggageInfo.map((baggage) => (
      <TableRow key={baggage.id} sx={{ backgroundColor: colors.primary[400] }}>
        <TableCell align="center" sx={{ color: colors.grey[100] }}>{baggage.passportNumber}</TableCell>
        <TableCell align="center" sx={{ color: colors.grey[100] }}>{baggage.dateOfLastDeparture}</TableCell>
        <TableCell align="center" sx={{ color: colors.grey[100] }}>{baggage.countryOfOrigin}</TableCell>
        <TableCell align="center" sx={{ color: colors.grey[100] }}>{baggage.dateOfArrival}</TableCell>
        <TableCell align="center" sx={{ color: colors.grey[100] }}>{baggage.flightOrVessel}</TableCell>
        <TableCell align="center" sx={{ color: colors.grey[100] }}>{baggage.airportArrival}</TableCell>
        <TableCell align="center" sx={{ color: colors.grey[100] }}>{baggage.familyMembers.below18}</TableCell>
        <TableCell align="center" sx={{ color: colors.grey[100] }}>{baggage.familyMembers.above18}</TableCell>
        <TableCell align="center" sx={{ color: colors.grey[100] }}>{baggage.numberOfBaggage.checkedIn}</TableCell>
        <TableCell align="center" sx={{ color: colors.grey[100] }}>{baggage.numberOfBaggage.handCarried}</TableCell>
        <TableCell align="center" sx={{ color: colors.grey[100] }}>{baggage.travelerType}</TableCell>
        <TableCell align="center" sx={{ color: colors.grey[100] }}>{baggage.purposeOfTravel}</TableCell>
        <TableCell align="center" sx={{ color: colors.grey[100] }}>{baggage.goodsValue}</TableCell>
        <TableCell align="center" sx={{ color: colors.grey[100] }}>{baggage.pesoDollarValue}</TableCell>
        <TableCell align="center" sx={{ color: colors.grey[100] }}>
          {Object.entries(baggage.bringingItems)
            .filter(([key, value]) => value && key !== 'otherGoods') // Filter out otherGoods from the list
            .map(([key]) => capitalizeFirstLetter(key)) // Capitalize first letter of each key
            .join(', ')}
          {baggage.bringingItems.otherGoods && (
            <span> (Other Goods: {baggage.bringingItems.otherGoods})</span>
          )}
        </TableCell>
        <TableCell align="center">
          <IconButton onClick={() => handleImageClick(baggage)}>
            <ImageIcon sx={{ color: colors.greenAccent[300] }} />
          </IconButton>
        </TableCell>
      </TableRow>
    ))
  ) : (
    <TableRow>
      <TableCell colSpan={16} align="center" sx={{ color: colors.grey[100] }}>
        No baggage information found for this passport number.
      </TableCell>
    </TableRow>
  )}
</TableBody>



            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary" variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Dialog */}
      <Dialog open={!!selectedImage} onClose={handleCloseImage}>
        <DialogTitle> Image Captured</DialogTitle>
        <DialogContent>
          {selectedImage && (
            <img src={selectedImage} alt="Baggage" style={{ width: '100%', height: 'auto' }} />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseImage} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ViewBaggage;
