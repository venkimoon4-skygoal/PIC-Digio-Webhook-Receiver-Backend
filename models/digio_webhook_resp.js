const mongoose = require("mongoose");

const digio_kyc_schema = new mongoose.Schema(
  {
    kidId: {
      type: String,
      default: "",
    },
    mobileNumber: {
      type: String,
      default: "",
    },
    requestData: {
      type: Object,
      default: {},
    },
    responseData: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

const DigioWebhook = mongoose.model("digo_kyc_webhook_resp", digio_kyc_schema);

module.exports = DigioWebhook;
