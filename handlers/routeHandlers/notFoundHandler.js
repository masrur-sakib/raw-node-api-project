/*
 * Name/Title: Not Found Handler
 * Description: Not Found Handler
 * Developer: Masrur Sakib
 * Date: 05/06/2021
 */

// Module Scaffolding
const handler = {};

handler.notFoundHandler = (requestProperties, callback) => {
  callback(404, {
    message: "Requested URL not found.",
  });
};

module.exports = handler;
