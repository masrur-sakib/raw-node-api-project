/*
 * Name/Title: Routes
 * Description: Application Routes
 * Developer: Masrur Sakib
 * Date: 05/06/2021
 */

// Dependencies
const { sampleHandler } = require("./handlers/routeHandlers/sampleHandler");
const { userHandler } = require("./handlers/routeHandlers/userHandler");

const routes = {
  sample: sampleHandler,
  user: userHandler,
};

module.exports = routes;
