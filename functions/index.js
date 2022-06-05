/* eslint-disable linebreak-style */
const express = require("express");
const functions = require("firebase-functions");
const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");

app.use(bodyParser.json());
app.use(cors());

// initialize firebase admin
initializeApp();
const db = getFirestore();

const setCache = function(req, res, next) {
  // define period in seconds for cache.
  const period = 60 * 10080;// 60 * 24 * 7; 1 week

  // you only want to cache for GET requests
  if (req.method == "GET") {
    res.set("Cache-control", `public, max-age=${period}`);
  } else {
    // for the other requests set strict no caching parameters
    res.set("Cache-control", "no-store");
  }
  next();
};

// now call the new middleware function in your app

app.use(setCache);

// create index route
app.get("/", (req, res) => {
  res.send("Hello there!");
});

// search route
app.get("/search", (req, res) => {
  // get amount query parameter
  const amount = Number(req.query.amount);
  const searchQuery = db.collection("products");
  searchQuery.get().then((querySnapshot) => {
    const products = [];
    querySnapshot.forEach((doc) => {
      // get transaction_bands array
      const transactionBands = doc.data().transaction_bands;
      // for each transaction_band
      for (let i = 0; i < transactionBands.length; i++) {
        // check if transaction is within the transaction_band range
        if (
          transactionBands[i].from <= amount &&
          transactionBands[i].to >= amount
        ) {
          // create an object and push it to the products array
          products.push({
            id: doc.id,
            name: doc.data().name,
            from: transactionBands[i].from,
            to: transactionBands[i].to,
            sending_charge: transactionBands[i].sending_charge,
            withdraw_charge: transactionBands[i].withdraw_charge,
          });
        }
      }
    });
    res.status().send(products);
  });
});

// get all products
app.get("/products", (req, res) => {
  db.collection("products")
      .get()
      .then((snapshot) => {
        const products = [];
        snapshot.forEach((doc) => {
          products.push(doc.data());
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
