/*
 * Name/Title: User Handler
 * Description: Handler to handle user related routes
 * Developer: Masrur Sakib
 * Date: 08/06/2021
 */

// Dependencies
const data = require("../../lib/data");
const { hash } = require("../../assets/utilities");
const { parseJSON } = require("../../assets/utilities");
const tokenHandler = require("./tokenHandler");

// Module Scaffolding
const handler = {};

handler.userHandler = (requestProperties, callback) => {
  const acceptedMethods = ["get", "post", "put", "delete"];
  if (acceptedMethods.indexOf(requestProperties.method) > -1) {
    handler._user[requestProperties.method](requestProperties, callback);
  } else {
    callback(405);
  }
};

handler._user = {};

// POST Method - User
handler._user.post = (requestProperties, callback) => {
  const firstName =
    typeof requestProperties.body.firstName === "string" &&
    requestProperties.body.firstName.trim().length > 0
      ? requestProperties.body.firstName
      : false;

  const lastName =
    typeof requestProperties.body.lastName === "string" &&
    requestProperties.body.lastName.trim().length > 0
      ? requestProperties.body.lastName
      : false;

  const phone =
    typeof requestProperties.body.phone === "string" &&
    requestProperties.body.phone.trim().length === 11
      ? requestProperties.body.phone
      : false;

  const password =
    typeof requestProperties.body.password === "string" &&
    requestProperties.body.password.trim().length > 0
      ? requestProperties.body.password
      : false;

  const tosAgreement =
    typeof requestProperties.body.tosAgreement === "boolean"
      ? requestProperties.body.tosAgreement
      : false;

  if (firstName && lastName && phone && password && tosAgreement) {
    // Check if the same user exists or not
    data.read("users", phone, (err) => {
      if (err) {
        let userObject = {
          firstName,
          lastName,
          phone,
          password: hash(password),
          tosAgreement,
        };

        // Store the user to database
        data.create("users", phone, userObject, (err) => {
          if (!err) {
            callback(200, {
              message: "User created successfully.",
            });
          } else {
            callback(500, {
              error: "Could not create user",
            });
          }
        });
      } else {
        callback(500, {
          error: "Server side error likely User already exists.",
        });
      }
    });
  } else {
    callback(400, {
      error: "Request error.",
    });
  }
};
// GET Method - User
handler._user.get = (requestProperties, callback) => {
  // Check if the phone number is valid
  const phone =
    typeof requestProperties.queryStringObject.get("phone") === "string" &&
    requestProperties.queryStringObject.get("phone").trim().length === 11
      ? requestProperties.queryStringObject.get("phone")
      : false;

  if (phone) {
    // Verify token
    const token =
      typeof requestProperties.headersObject.token === "string"
        ? requestProperties.headersObject.token
        : false;

    tokenHandler._token.verify(token, phone, (tokenId) => {
      if (tokenId) {
        // Fine the user
        data.read("users", phone, (err, usr) => {
          const user = { ...parseJSON(usr) };
          if (!err && user) {
            delete user.password;
            callback(200, user);
          } else {
            callback(404, {
              error: "Requested user not found (2)",
            });
          }
        });
      } else {
        callback(403, {
          error: "Authentication failed.",
        });
      }
    });
  } else {
    callback(404, {
      error: "Requested user not found (1)",
    });
  }
};
// PUT Method - User
handler._user.put = (requestProperties, callback) => {
  const phone =
    typeof requestProperties.body.phone === "string" &&
    requestProperties.body.phone.trim().length === 11
      ? requestProperties.body.phone
      : false;

  const firstName =
    typeof requestProperties.body.firstName === "string" &&
    requestProperties.body.firstName.trim().length > 0
      ? requestProperties.body.firstName
      : false;

  const lastName =
    typeof requestProperties.body.lastName === "string" &&
    requestProperties.body.lastName.trim().length > 0
      ? requestProperties.body.lastName
      : false;

  const password =
    typeof requestProperties.body.password === "string" &&
    requestProperties.body.password.trim().length > 0
      ? requestProperties.body.password
      : false;

  if (phone) {
    if (firstName || lastName || password) {
      // Verify token
      const token =
        typeof requestProperties.headersObject.token === "string"
          ? requestProperties.headersObject.token
          : false;

      tokenHandler._token.verify(token, phone, (tokenId) => {
        if (tokenId) {
          // Check if the user exists or not
          data.read("users", phone, (err, usrData) => {
            const userData = { ...parseJSON(usrData) };
            if (!err && userData) {
              if (firstName) {
                userData.firstName = firstName;
              }
              if (lastName) {
                userData.lastName = lastName;
              }
              if (password) {
                userData.password = hash(password);
              }

              // Update Database
              data.update("users", phone, userData, (err) => {
                if (!err) {
                  callback(200, {
                    error: "User data updated successfully.",
                  });
                } else {
                  callback(500, {
                    error: "There was a problem in server side",
                  });
                }
              });
            } else {
              callback(404, {
                error: "Requested user not found (2)",
              });
            }
          });
        } else {
          callback(403, {
            error: "Authentication failed.",
          });
        }
      });
    } else {
      callback(400, {
        error: "Error! Problem in request.",
      });
    }
  } else {
    callback(400, {
      error: "Invalid phone number, Please try again.",
    });
  }
};
// DELETE Method - User
handler._user.delete = (requestProperties, callback) => {
  // Check if the phone number is valid
  const phone =
    typeof requestProperties.queryStringObject.get("phone") === "string" &&
    requestProperties.queryStringObject.get("phone").trim().length === 11
      ? requestProperties.queryStringObject.get("phone")
      : false;
  if (phone) {
    // Verify token
    const token =
      typeof requestProperties.headersObject.token === "string"
        ? requestProperties.headersObject.token
        : false;

    tokenHandler._token.verify(token, phone, (tokenId) => {
      if (tokenId) {
        // Check if the user exists or not
        data.read("users", phone, (err, userData) => {
          if (!err && userData) {
            data.delete("users", phone, (err) => {
              if (!err) {
                callback(200, {
                  message: "User deleted successfully.",
                });
              } else {
                callback(500, {
                  error: "Error! Problem in server side (2)",
                });
              }
            });
          } else {
            callback(500, {
              error: "Error! Problem in server side.",
            });
          }
        });
      } else {
        callback(403, {
          error: "Authentication failed.",
        });
      }
    });
  } else {
    callback(400, {
      error: "Error! Problem in your request.",
    });
  }
};

module.exports = handler;
