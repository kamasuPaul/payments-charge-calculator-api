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

// create index route
app.get("/", (req, res) => {
  res.send("Hello there!");
});

// get all products
app.get("/products", (req, res) => {
  db.collection("products")
  .get()
  .then(snapshot => {
      const products = [];
      snapshot.forEach(doc => {
          products.push({
              id: doc.id,
              ...doc.data()
          });
      });
      res.send(products);
  })
  .catch(err => {
      console.log("Error getting documents", err);
  });
});

// app.listen(4000, () => {
//   console.log("Server started on port 3000");
// });

// export functions
exports.api = functions.https.onRequest(app);
