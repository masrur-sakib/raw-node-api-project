/*
 * Name/Title: Sample Handler
 * Description: Sample Handler
 * Developer: Masrur Sakib
 * Date: 05/06/2021
 */

// Module Scaffolding
const handler = {};

handler.sampleHandler = (requestProperties, callback) => {
  const acceptedMethods = ["get", "post", "put", "delete"];
  if (acceptedMethods.indexOf(requestProperties.method) > -1) {
    handler._users[requestProperties.method](requestProperties, callback);
  } else {
    callback(405);
  }
};

handler._users = {};

handler._users.post = (requestProperties, callback) => {};
handler._users.get = (requestProperties, callback) => {};
handler._users.put = (requestProperties, callback) => {};
handler._users.delete = (requestProperties, callback) => {};

module.exports = handler;
