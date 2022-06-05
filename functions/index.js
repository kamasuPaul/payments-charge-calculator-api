/* eslint-disable linebreak-style */
const express = require("express");
const functions = require("firebase-functions");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");

app.use(bodyParser.json());
app.use(cors());

// initialize firebase admin
initializeApp();
const db = getFirestore();

// create index route
app.get("/", (req, res) => {
  res.send("Hello there!");
});

//search route
app.get("/search", (req, res) => {
  //get amount query parameter
  const amount = Number(req.query.amount);
  const searchQuery = db.collection("products");
  searchQuery.get().then((querySnapshot) => {
    const products = [];
    querySnapshot.forEach((doc) => {
      //get transaction_bands array
      const transaction_bands = doc.data().transaction_bands;
      //for each transaction_band
      for (let i = 0; i < transaction_bands.length; i++) {
        // check if transaction is within the transaction_band range
        if (
          transaction_bands[i].from <= amount &&
          transaction_bands[i].to >= amount
        ) {
          //create an object and push it to the products array
          products.push({
            id: doc.id,
            name: doc.data().name,
            from: transaction_bands[i].from,
            to: transaction_bands[i].to,
            sending_charge: transaction_bands[i].sending_charge,
            withdraw_charge: transaction_bands[i].withdraw_charge,
          });
        }
      }
    });
    res.send(products);
  });
});

// get all products
app.get("/products", (req, res) => {
  db.collection("products")
    .get()
    .then((snapshot) => {
      const products = [];
      snapshot.forEach((doc) => {
        products.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      res.send(products);
    })
    .catch((err) => {
      console.log("Error getting documents", err);
    });
});

// app.listen(4000, () => {
//   console.log("Server started on port 3000");
// });

// export functions
exports.api = functions.https.onRequest(app);
