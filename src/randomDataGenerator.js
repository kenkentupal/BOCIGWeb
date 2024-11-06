import React from "react";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { v4 as uuidv4 } from "uuid"; // To generate unique IDs
import { faker } from "@faker-js/faker";

// Initialize Firebase Admin SDK
const firebaseConfig = {
  credential: admin.credential.cert(require("./Firebase.js")), // Ensure this path is correct
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const generateRandomDocument = () => {
  return {
    airportArrival: faker.random.arrayElement([
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
    nationality: faker.random.arrayElement([
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
      "FRA",
      "ITA",
      "CHN",
      "KOR",
      "BRA",
      "RUS",
      "SAU",
      "ZAF",
      "EGY",
      "THA",
      "ARG",
      "VNM",
      "TUR",
      "ESP",
      "SWE",
      "NLD",
      "CHE",
      "POL",
      "NOR",
      "NZL",
    ]),
    dateOfArrival: faker.date
      .between("2020-01-01", new Date())
      .toISOString()
      .split("T")[0],
    dateOfBirth: faker.date
      .between("1950-01-01", "2005-12-31")
      .toISOString()
      .split("T")[0],
    dateOfLastDeparture: faker.date
      .between("2020-01-01", new Date())
      .toISOString()
      .split("T")[0],
    declaration: faker.datatype.boolean(),
    faceRecognitionScan: false,
    familyMembers: {
      above18: faker.number.int({ min: 1, max: 5 }),
      below18: faker.number.int({ min: 0, max: 3 }),
    },
    firstName: faker.name.firstName(),
    middleName: faker.name.middleName(),
    surName: faker.name.lastName(),
    flightOrVessel: faker.random.alphaNumeric(6),
    gender: faker.random.arrayElement(["Male", "Female"]),
    goodsValue: faker.number.int({ min: 1, max: 100000 }).toString(),
    countryOfOrigin: faker.random.arrayElement([
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
      "FRA",
      "ITA",
      "CHN",
      "KOR",
      "BRA",
      "RUS",
      "SAU",
      "ZAF",
      "EGY",
      "THA",
      "ARG",
      "VNM",
      "TUR",
      "ESP",
      "SWE",
      "NLD",
      "CHE",
      "POL",
      "NOR",
      "NZL",
    ]),
    numberOfBaggage: {
      checkedIn: faker.number.int({ min: 1, max: 5 }),
      handCarried: faker.number.int({ min: 0, max: 2 }),
    },
    occupation: faker.name.jobTitle(),
    passengerDetails: "",
    passportNumber: `P${faker.random.alphaNumeric(8).toUpperCase()}`,
    passportScan: false,
    pesoDollarValue: faker.number.int({ min: 0, max: 1000000 }).toString(),
    placeIssued: faker.random.arrayElement(["PHL", "USA", "JPN", "SGP"]),
    purposeOfTravel: faker.random.arrayElement([
      "Business",
      "Vacation",
      "Study",
    ]),
    time: new Date().toISOString(),
    travelerType: faker.random.arrayElement([
      "Filipino",
      "OFW",
      "Resident",
      "Non-Resident",
      "On-Board Courier",
      "Non-Filipino",
      "Diplomat",
      "Crew",
    ]),
  };
};

const addDocuments = async (numDocs) => {
  const collectionRef = db.collection("PassengerData");
  for (let i = 0; i < numDocs; i++) {
    const docData = generateRandomDocument();
    await collectionRef.doc(uuidv4()).set(docData);
    console.log(`Document ${i + 1} added.`);
  }
};

// React Component to add documents
const DocumentGenerator = () => {
  const handleGenerateDocuments = () => {
    addDocuments(10)
      .then(() => console.log("Documents added successfully"))
      .catch((error) => console.error("Error adding documents: ", error));
  };

  return (
    <div>
      <h1>Passenger Document Generator</h1>
      <button onClick={handleGenerateDocuments}>Generate Documents</button>
    </div>
  );
};

export default DocumentGenerator;
