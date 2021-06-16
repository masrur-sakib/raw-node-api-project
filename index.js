// Dependencies
const http = require("http");
const { handleReqRes } = require("./assets/handleReqRes");
const environment = require("./assets/environments");
const data = require("./lib/data");
const { sendTwilioSms } = require("./assets/notifications");

// Module Scaffolding
const app = {};

// Twilio sms sending function - Remove after work
sendTwilioSms("01747020380", "Hello World", (err) => {
  console.log("Twilio Request Status: ", err);
});

// Create Server
app.createServer = () => {
  const server = http.createServer(app.handleReqRes);
  server.listen(environment.port, () => {
    console.log(`Listening to port ${environment.port}`);
  });
};

// Function that handles Request & Response
app.handleReqRes = handleReqRes;

// Start the Server
app.createServer();
