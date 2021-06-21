/*
 * Name/Title: Workers Libraries
 * Description: Server related files
 * Developer: Masrur Sakib
 * Date: 17/06/2021
 */

// Dependencies
const url = require("url");
const data = require("./data");
const { parseJSON } = require("../assets/utilities");
const { sendTwilioSms } = require("../assets/notifications");
const http = require("http");
const https = require("https");

// Module Scaffolding - Server object
const worker = {};

// Find all the checks in database
worker.gatherAllChecks = () => {
  // Get all the checks
  data.list("checks", (err, checks) => {
    if (!err && checks && checks.length > 0) {
      checks.forEach((check) => {
        // Read the checkData
        data.read("checks", check, (err, originalCheckData) => {
          if (!err && originalCheckData) {
            // Pass the data to the check validator
            worker.validateCheckData(parseJSON(originalCheckData));
          } else {
            console.log("Error: reading the check data.");
          }
        });
      });
    } else {
      console.log("Error: could not find any checks to process.");
    }
  });
};

// Check validator function
worker.validateCheckData = (originalCheckData) => {
  let originalData = originalCheckData;
  if (originalCheckData && originalCheckData.id) {
    originalData.state =
      typeof originalCheckData.state === "string" &&
      ["up", "down"].indexOf(originalCheckData.state) > -1
        ? originalCheckData.state
        : "down";

    originalData.lastChecked =
      typeof originalCheckData.lastChecked === "number" &&
      originalCheckData.lastChecked > 0
        ? originalCheckData.lastChecked
        : false;

    worker.performCheck(originalData);
  } else {
    console.log("Error: check was invalid or not properly formatted.");
  }
};

// Perform check function
worker.performCheck = (originalCheckData) => {
  // Prepare the initial check outcome
  let checkOutcome = {
    error: false,
    responseCode: false,
  };

  // Check if the outcome has already been sent or not
  let outcomeSent = false;

  // Parse the hostname & full url from original data

  const baseURL = `${originalCheckData.protocol}://${originalCheckData.url}`;
  const parsedUrl = new URL(baseURL, baseURL);
  const hostName = parsedUrl.hostname;
  const path = parsedUrl.pathname;

  // Construct the request
  const requestDetails = {
    protocol: `${originalCheckData.protocol}:`,
    hostname: hostName,
    method: originalCheckData.method.toUpperCase(),
    path,
    timeout: originalCheckData.timeoutSeconds * 1000,
  };

  const protocolToUse = originalCheckData.protocol === "http" ? http : https;

  const req = protocolToUse.request(requestDetails, (res) => {
    // Grab the status code of the response
    const status = res.statusCode;

    // Update the check outcome and pass to the next process
    checkOutcome.responseCode = status;
    if (!outcomeSent) {
      worker.processCheckOutcome(originalCheckData, checkOutcome);
      outcomeSent = true;
    }
  });

  req.on("error", (e) => {
    checkOutcome = {
      error: true,
      value: e,
    };

    // Update the check outcome and pass to the next process
    if (!outcomeSent) {
      worker.processCheckOutcome(originalCheckData, checkOutcome);
      outcomeSent = true;
    }
  });

  req.on("timeout", () => {
    checkOutcome = {
      error: true,
      value: "timeout",
    };

    // Update the check outcome and pass to the next process
    if (!outcomeSent) {
      worker.processCheckOutcome(originalCheckData, checkOutcome);
      outcomeSent = true;
    }
  });

  // Send request
  req.end();
};

// Send check outcome to database and initiate the notification function if needed
worker.processCheckOutcome = (originalCheckData, checkOutcome) => {
  // Check if the check outcome is up or down
  let state =
    !checkOutcome.error &&
    checkOutcome.responseCode &&
    originalCheckData.successCodes.indexOf(checkOutcome.responseCode) > -1
      ? "up"
      : "down";

  // Decide should the notification sent to user or or not
  let alertWanted =
    originalCheckData.lastChecked && originalCheckData.state !== state
      ? true
      : false;

  // Update the check data
  let newCheckData = originalCheckData;

  newCheckData.state = state;
  newCheckData.lastChecked = Date.now();

  // Update the new check details data to database
  data.update("checks", newCheckData.id, newCheckData, (err) => {
    if (!err) {
      if (alertWanted) {
        // Initiate the notification function to send notification to the user
        worker.alertUserToStatusChange(newCheckData);
      } else {
        console.log("Alert is not needed as there is no state changed.");
      }
    } else {
      console.log("Error! update failed, server side problem.");
    }
  });
};

// Function to Send notification to user
worker.alertUserToStatusChange = (newCheckData) => {
  let msg = `Your website ${newCheckData.protocol}://${newCheckData.url} is currently ${newCheckData.state}, Please check.`;

  sendTwilioSms("01747020380", msg, (err) => {
    if (!err) {
      console.log(`User was alerted to a status change via sms: ${msg}`);
    } else {
      console.log(
        "There was a problem in sending website status update sms to one of the the user",
        err
      );
    }
  });
};

// Timer to execute the worker process once per minute
worker.loop = () => {
  setInterval(() => {
    worker.gatherAllChecks();
  }, 8000);
};

// Start the workers monitoring
worker.init = () => {
  // Execute all the checks
  worker.gatherAllChecks();

  // Do the checks in loop so that checks repeat continuously
  worker.loop();
};

// Export Module
module.exports = worker;
