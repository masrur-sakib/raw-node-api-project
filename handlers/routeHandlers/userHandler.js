/*
 * Name/Title: User Handler
 * Description: Handler to handle user related routes
 * Developer: Masrur Sakib
 * Date: 08/06/2021
 */

// Module Scaffolding
const handler = {};

handler.userHandler = (requestProperties, callback) => {
  callback(200, {
    message: "This is a user url.",
  });
};

module.exports = handler;
