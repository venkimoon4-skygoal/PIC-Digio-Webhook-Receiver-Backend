require("dotenv/config.js");
const express = require("express");
const db = require("./db.js");
const app = express();
const cors = require("cors");
const WebhookRouter = require("./routes/webhook.js");

app.use(express.json());
app.use(cors());

app.use("/webhook", WebhookRouter);

app.listen(process.env.PORT, () => {
  console.log(`Listening to port ${process.env.PORT}`);
});
