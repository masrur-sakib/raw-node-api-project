// Dependencies
const http = require("http");
const { handleReqRes } = require("./assets/handleReqRes");
const environment = require("./assets/environments");
const data = require("./lib/data");

// App Object - Module Scaffolding
const app = {};

// lib.create = (dir, file, data, callback) => {

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
