import React, { useState } from "react";
import { faker } from "@faker-js/faker";
import { getFirestore, collection, setDoc, doc } from "firebase/firestore";
import { getStorage, ref, uploadString } from "firebase/storage";

const db = getFirestore();
const storage = getStorage();

const PassengerForm = () => {
  const [numberOfEntries, setNumberOfEntries] = useState(1);

  const generateBaggageData = (passengerData) => {
    return {
      airportArrival: faker.helpers.arrayElement([
        "NAIA",
        "MCIA",
        "CRK",
        "DVO",
        "ILO",
        "KLO",
        "BCD",
        "LAO",
        "SFS",
        "GES",
        "PPS",
        "TAG",
      ]),
      bringingItems: {
        otherGoods: Array.from(
          { length: faker.number.int({ min: 0, max: 3 }) },
          () =>
            faker.helpers.arrayElement([
              "books",
              "toys",
              "cosmetics",
              "souvenirs",
              "jewelry",
              "tools",
            ])
        ),
        foreignCurrency: faker.datatype.boolean(),
        gambling: faker.datatype.boolean(),
        cosmetics: faker.datatype.boolean(),
        drugs: faker.datatype.boolean(),
        firearms: faker.datatype.boolean(),
        alcoholTobacco: faker.datatype.boolean(),
        foodstuff: faker.datatype.boolean(),
        electronics: faker.datatype.boolean(),
        cremains: faker.datatype.boolean(),
        jewelry: faker.datatype.boolean(),
      },
      dateOfArrival: faker.date
        .between({ from: new Date("2020-01-01"), to: new Date() })
        .toISOString()
        .split("T")[0],
      dateOfLastDeparture: faker.date
        .between({ from: new Date("2020-01-01"), to: new Date() })
        .toISOString()
        .split("T")[0],
      declaration: faker.datatype.boolean(true),
      faceRecognitionScan: false,
      familyMembers: {
        above18: faker.number.int({ min: 1, max: 5 }),
        below18: faker.number.int({ min: 0, max: 3 }),
      },
      flightOrVessel: faker.string.alphanumeric(6),
      goodsValue: faker.number.int({ min: 1, max: 100000 }).toString(),
      numberOfBaggage: {
        checkedIn: faker.number.int({ min: 1, max: 5 }),
        handCarried: faker.number.int({ min: 0, max: 2 }),
      },
      purposeOfTravel: faker.helpers.arrayElement([
        "Business",
        "Vacation",
        "Study",
      ]),
      travelerType: faker.helpers.arrayElement([
        "Filipino",
        "OFW",
        "Resident",
        "Non-Resident",
      ]),
      pesoDollarValue: faker.number.float({
        min: 50,
        max: 60,
        precision: 0.01,
      }), // Add random peso-dollar value
      countryOfOrigin: faker.helpers.arrayElement([
        "PHL", // Philippines
        "USA", // United States
        "JPN", // Japan
        "SGP", // Singapore
        "CAN", // Canada
        "MEX", // Mexico
        "GBR", // United Kingdom
        "AUS", // Australia
        "IND", // India
        "DEU", // Germany
      ]), // Add random country of origin
      // Use existing passenger data fields
      dateOfBirth: passengerData.dateOfBirth,
      passportNumber: passengerData.passportNumber,
      firstName: passengerData.firstName,
      gender: passengerData.gender,
      lastName: passengerData.lastName,
      middleName: passengerData.middleName,
      nationality: passengerData.nationality,
      occupation: passengerData.occupation,
      placeIssued: passengerData.placeIssued,
      time: passengerData.time,
      profileImage: passengerData.profileImage,
    };
  };

  const generateFakeData = async () => {
    const passengerDataArray = Array.from({ length: numberOfEntries }, () => {
      const dateOfArrival = faker.date
        .between({ from: new Date("2020-01-01"), to: new Date() })
        .toISOString()
        .split("T")[0];
      const passportNumber = `P${faker.string.alphanumeric(8).toUpperCase()}`;
      const firstName = faker.name.firstName();
      const middleName = faker.name.middleName();
      const lastName = faker.name.lastName();
      const gender = faker.helpers.arrayElement(["Male", "Female"]);
      const nationality = faker.helpers.arrayElement([
        "PHL",
        "USA",
        "JPN",
        "SGP",
        "CAN",
        "MEX",
        "GBR",
        "AUS",
        "IND",
        "DEU",
      ]);
      const occupation = faker.name.jobTitle();
      const placeIssued = faker.helpers.arrayElement([
        "PHL",
        "USA",
        "JPN",
        "SGP",
      ]);
      const time = new Date().toISOString();
      const profileImage = faker.image.avatar(); // Sample profile image

      // Data for "Passenger" collection
      const passengerData = {
        dateOfBirth: faker.date
          .between({ from: new Date("1950-01-01"), to: new Date("2005-12-31") })
          .toISOString()
          .split("T")[0],
        passportNumber,
        firstName,
        gender,
        lastName,
        middleName,
        nationality,
        occupation,
        placeIssued,
        time,
        profileImage,
      };

      // Generate baggage data using the passenger data
      const baggageData = generateBaggageData(passengerData);

      return { baggageData, passengerData };
    });

    // Add each generated passenger data to Firestore
    for (const { baggageData, passengerData } of passengerDataArray) {
      const documentId = `${baggageData.passportNumber}${baggageData.dateOfArrival}`;

      try {
        // Upload profile image to Firebase Storage
        const imageRef = ref(
          storage,
          `FaceImages/${baggageData.airportArrival}/${baggageData.airportArrival}done/${baggageData.passportNumber}${baggageData.dateOfArrival}.png`
        );
        const imageBlob = await fetch(baggageData.profileImage).then((res) =>
          res.blob()
        );
        await uploadString(imageRef, await blobToBase64(imageBlob), "data_url");

        // Add to "BaggageInfo" collection
        await setDoc(
          doc(collection(db, "BaggageInfo"), documentId),
          baggageData
        );
        console.log("BaggageInfo document written with ID: ", documentId);

        // Add to "Passenger" collection
        await setDoc(
          doc(collection(db, "ResultTable"), baggageData.passportNumber),
          passengerData
        );
        console.log("Passenger document written with ID: ", documentId);
      } catch (e) {
        if (e.code === "permission-denied") {
          console.error("Firestore permission error. Check Firestore rules.");
        } else {
          console.error("Error adding document:", e.message);
        }
      }
    }
  };

  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  return (
    <div>
      <h2>Generate Passenger Data</h2>
      <input
        type="number"
        value={numberOfEntries}
        onChange={(e) => setNumberOfEntries(Number(e.target.value))}
        min="1"
      />
      <button onClick={generateFakeData}>Generate and Upload</button>
    </div>
  );
};

export default PassengerForm;
