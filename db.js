const mongoose = require("mongoose");

let mongodburl = process.env.MONGODB_URL_TEST;

if (process.env.NODE_ENVIRONMENT === "PROD") {
  mongodburl = process.env.MONGODB_URL;
}

mongoose.connect(mongodburl);

const db = mongoose.connection;

db.on("connected", () => {
  console.log("Connected to MongoDB Successfully");
});

db.on("disconnected", () => {
  console.log("MongoDB Server Disconnected");
});

db.on("error", (error) => {
  console.log("Error in Connecting MongoDB Server", error.message);
});

module.exports = db;
