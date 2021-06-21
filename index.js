/*
 * Name/Title: Initial Project File
 * Description: Initial file to start the node server and workers
 * Developer: Masrur Sakib
 * Date: 01/06/2021
 */

// Dependencies
const server = require("./lib/server");
const workers = require("./lib/worker");

// Module Scaffolding
const app = {};

app.init = () => {
  // Start the server
  server.init();

  // Start the workers
  workers.init();
};

app.init();

// Module Export
module.exports = app;
