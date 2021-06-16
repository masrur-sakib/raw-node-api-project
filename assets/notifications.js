/*
 * Name/Title: Notifications libraries & functions
 * Description: Handle functions to notify users
 * Developer: Masrur Sakib
 * Date: 15/06/2021
 */

// Dependencies
const https = require("https");
const querystring = require("querystring");
const { twilio } = require("./environments");

// Module Scaffolding
const notifications = {};

// Send sms to user using twilio api
notifications.sendTwilioSms = (phone, msg, callback) => {
  // Input Validation
  const userPhone =
    typeof phone === "string" && phone.trim().length === 11
      ? phone.trim()
      : false;

  const userMsg =
    typeof msg === "string" &&
    msg.trim().length > 0 &&
    msg.trim().length <= 1600
      ? msg.trim()
      : false;

  if (userPhone && userMsg) {
    // Configure the request payload
    const payload = {
      From: twilio.fromPhone,
      To: `+88${userPhone}`,
      Body: userMsg,
    };

    // Stringify the payload
    const stringifiedPayload = querystring.stringify(payload);

    // Configure the request details
    const requestDetails = {
      hostname: "api.twilio.com",
      method: "POST",
      path: `/2010-04-01/Accounts/${twilio.accountSid}/Messages.json`,
      auth: `${twilio.accountSid}:${twilio.authToken}`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    };

    // Instantiate the request object
    const req = https.request(requestDetails, (res) => {
      // Get the status of the sent request
      const status = res.statusCode;

      //   Successful callback codes
      if (status === 200 || status === 201) {
        callback(false);
      } else {
        callback(`Returned status was ${status}`);
      }
    });

    req.on("error", (e) => {
      callback(e);
    });

    req.write(stringifiedPayload);
    req.end();
  } else {
    callback(400, {
      error: "Error! Problem in your request.",
    });
  }
};

// Module Export
module.exports = notifications;
