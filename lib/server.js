/*
 * Name/Title: Server Libraries
 * Description: Server related files
 * Developer: Masrur Sakib
 * Date: 17/06/2021
 */

// Dependencies
const http = require("http");
const { handleReqRes } = require("../assets/handleReqRes");
const environment = require("../assets/environments");
const data = require("./data");
const { sendTwilioSms } = require("../assets/notifications");

// Module Scaffolding - Server object
const server = {};

// Twilio sms sending function - Remove after work
// sendTwilioSms("01747020380", "Hello World", (err) => {
//   console.log("Twilio Request Status: ", err);
// });

// Create Server
server.createServer = () => {
  const createServerVariable = http.createServer(server.handleReqRes);
  createServerVariable.listen(environment.port, () => {
    console.log(`Listening to port ${environment.port}`);
  });
};

// Function that handles Request & Response
server.handleReqRes = handleReqRes;

// Start the Server
server.init = () => {
  server.createServer();
};

// Export Module
module.exports = server;
