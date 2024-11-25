const _ = require("lodash");

//success response handler
const success_response = (code, message, response, status) => {
  if (!_.isInteger(code)) {
    return console.error("Status Code is Required");
  }
  if (_.isEmpty(message)) {
    return console.error("Message is Required");
  }
  if (!_.isObject(response)) {
    return console.error("Response Should be an Object");
  }
  if (!_.isBoolean(status)) {
    return console.error("Status is Required");
  }

  return { code, message, response: response || {}, status };
};

//failure response handler
const failed_response = (code, message, response, status) => {
  if (!_.isInteger(code)) {
    return console.error("Code is empty");
  }

  if (_.isEmpty(message)) {
    return console.error("message is empty");
  }

  if (!_.isObject(response)) {
    return console.error("response is not object");
  }
  if (!_.isBoolean(status)) {
    return console.error("status is empty");
  }
  return { code, message, response: response || {}, status };
};

//async handler
const catchAsync = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      return res
        .status(500)
        .json(
          failure_response(
            500,
            "Internal Server Error",
            { message: error.message },
            false
          )
        );
    }
  };
};

module.exports = { success_response, failed_response, catchAsync };
