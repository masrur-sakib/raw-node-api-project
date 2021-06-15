/*
 * Name/Title: Routes
 * Description: Application Routes
 * Developer: Masrur Sakib
 * Date: 05/06/2021
 */

// Dependencies
const { sampleHandler } = require("./handlers/routeHandlers/sampleHandler");
const { userHandler } = require("./handlers/routeHandlers/userHandler");
const { tokenHandler } = require("./handlers/routeHandlers/tokenHandler");

const routes = {
  sample: sampleHandler,
  user: userHandler,
  token: tokenHandler,
};

module.exports = routes;
