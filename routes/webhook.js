const express = require("express");
const receiveWebhook = require("../controllers/receive-webhooks/receiveWebhook");

const router = express.Router();

router.post("/digio-kyc-response", receiveWebhook);

module.exports = router;
