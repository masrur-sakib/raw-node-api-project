/*
 * Name/Title: Check Handler
 * Description: Handler to handle user defined checks
 * Developer: Masrur Sakib
 * Date: 15/06/2021
 */

// Dependencies
const data = require("../../lib/data");
const { createRandomString } = require("../../assets/utilities");
const { parseJSON } = require("../../assets/utilities");
const tokenHandler = require("./tokenHandler");
const { maxChecks } = require("../../assets/environments");

// Module Scaffolding
const handler = {};

handler.checkHandler = (requestProperties, callback) => {
  const acceptedMethods = ["get", "post", "put", "delete"];
  if (acceptedMethods.indexOf(requestProperties.method) > -1) {
    handler._check[requestProperties.method](requestProperties, callback);
  } else {
    callback(405);
  }
};

handler._check = {};

// POST Method - Check
handler._check.post = (requestProperties, callback) => {
  // Validate inputs
  let protocol =
    typeof requestProperties.body.protocol === "string" &&
    ["http", "https"].indexOf(requestProperties.body.protocol) > -1
      ? requestProperties.body.protocol
      : false;

  let url =
    typeof requestProperties.body.url === "string" &&
    requestProperties.body.url.trim().length > 0
      ? requestProperties.body.url
      : false;

  let method =
    typeof requestProperties.body.method === "string" &&
    ["GET", "POST", "PUT", "DELETE"].indexOf(requestProperties.body.method) > -1
      ? requestProperties.body.method
      : false;

  let successCodes =
    typeof requestProperties.body.successCodes === "object" &&
    requestProperties.body.successCodes instanceof Array
      ? requestProperties.body.successCodes
      : false;

  let timeoutSeconds =
    typeof requestProperties.body.timeoutSeconds === "number" &&
    requestProperties.body.timeoutSeconds % 1 === 0 &&
    requestProperties.body.timeoutSeconds >= 1 &&
    requestProperties.body.timeoutSeconds <= 5
      ? requestProperties.body.timeoutSeconds
      : false;

  if (protocol && url && method && successCodes && timeoutSeconds) {
    // Verify token
    const token =
      typeof requestProperties.headersObject.token === "string"
        ? requestProperties.headersObject.token
        : false;

    // Find the user corresponding phone number of token
    data.read("tokens", token, (err, tokenData) => {
      if (!err) {
        let userPhone = parseJSON(tokenData).phone;
        data.read("users", userPhone, (err, userData) => {
          if (!err && userData) {
            tokenHandler._token.verify(token, userPhone, (tokenIsValid) => {
              if (tokenIsValid) {
                let userObject = parseJSON(userData);
                let userChecks =
                  typeof userObject.checks === "object" &&
                  userObject.checks instanceof Array
                    ? userObject.checks
                    : [];
                if (userChecks.length < maxChecks) {
                  let checkId = createRandomString(20);
                  let checkObject = {
                    id: checkId,
                    userPhone,
                    protocol,
                    url,
                    method,
                    successCodes,
                    timeoutSeconds,
                  };

                  //   Save the check object in database
                  data.create("checks", checkId, checkObject, (err) => {
                    if (!err) {
                      // Add checkId to the user's object
                      userObject.checks = userChecks;
                      userObject.checks.push(checkId);

                      //   Save the new user data
                      data.update("users", userPhone, userObject, (err) => {
                        if (!err) {
                          callback(200, checkObject);
                        } else {
                          callback(500, {
                            error: "Error! Problem in server side.",
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
                  callback(401, {
                    error: "User already reached maximum checks limit.",
                  });
                }
              } else {
                callback(403, {
                  error: "Authentication Problem.",
                });
              }
            });
          } else {
            callback(403, {
              error: "User not found",
            });
          }
        });
      } else {
        callback(403, {
          error: "Authentication Problem.",
        });
      }
    });
  } else {
    callback(400, {
      error: "Problem in your request",
    });
  }
};
// GET Method - Check
handler._check.get = (requestProperties, callback) => {
  // Check if the token id is valid
  const id =
    typeof requestProperties.queryStringObject.get("id") === "string" &&
    requestProperties.queryStringObject.get("id").trim().length === 20
      ? requestProperties.queryStringObject.get("id")
      : false;

  if (id) {
    // find the check in database
    data.read("checks", id, (err, checkData) => {
      if (!err && checkData) {
        const token =
          typeof requestProperties.headersObject.token === "string"
            ? requestProperties.headersObject.token
            : false;

        tokenHandler._token.verify(
          token,
          parseJSON(checkData).userPhone,
          (tokenIsValid) => {
            if (tokenIsValid) {
              callback(200, parseJSON(checkData));
            } else {
              callback(403, {
                error: "Authentication Failure.",
              });
            }
          }
        );
      } else {
        callback(400, {
          error: "Error! Problem in the server side.",
        });
      }
    });
  } else {
    callback(400, {
      error: "Error! Problem in your request.",
    });
  }
};
// PUT Method - Check
handler._check.put = (requestProperties, callback) => {
  const id =
    typeof requestProperties.body.id === "string" &&
    requestProperties.body.id.trim().length === 20
      ? requestProperties.body.id
      : false;

  // Validate inputs
  let protocol =
    typeof requestProperties.body.protocol === "string" &&
    ["http", "https"].indexOf(requestProperties.body.protocol) > -1
      ? requestProperties.body.protocol
      : false;

  let url =
    typeof requestProperties.body.url === "string" &&
    requestProperties.body.url.trim().length > 0
      ? requestProperties.body.url
      : false;

  let method =
    typeof requestProperties.body.method === "string" &&
    ["GET", "POST", "PUT", "DELETE"].indexOf(requestProperties.body.method) > -1
      ? requestProperties.body.method
      : false;

  let successCodes =
    typeof requestProperties.body.successCodes === "object" &&
    requestProperties.body.successCodes instanceof Array
      ? requestProperties.body.successCodes
      : false;

  let timeoutSeconds =
    typeof requestProperties.body.timeoutSeconds === "number" &&
    requestProperties.body.timeoutSeconds % 1 === 0 &&
    requestProperties.body.timeoutSeconds >= 1 &&
    requestProperties.body.timeoutSeconds <= 5
      ? requestProperties.body.timeoutSeconds
      : false;

  if (id) {
    if (protocol || url || method || successCodes || timeoutSeconds) {
      data.read("checks", id, (err, checkData) => {
        if (!err && checkData) {
          let checkObject = parseJSON(checkData);

          // Verify token
          const token =
            typeof requestProperties.headersObject.token === "string"
              ? requestProperties.headersObject.token
              : false;

          tokenHandler._token.verify(
            token,
            checkObject.userPhone,
            (tokenIsValid) => {
              if (tokenIsValid) {
                if (protocol) {
                  checkObject.protocol = protocol;
                }
                if (url) {
                  checkObject.url = url;
                }
                if (method) {
                  checkObject.method = method;
                }
                if (successCodes) {
                  checkObject.successCodes = successCodes;
                }
                if (timeoutSeconds) {
                  checkObject.timeoutSeconds = timeoutSeconds;
                }

                // Store the checkObject in database
                data.update("checks", id, checkObject, (err) => {
                  if (!err) {
                    callback(200, checkObject);
                  } else {
                    callback(500, {
                      error: "Error! Problem in the server side.",
                    });
                  }
                });
              } else {
                callback(403, {
                  error: "Authentication Error!.",
                });
              }
            }
          );
        } else {
          callback(500, {
            error: "Error! Problem in the server side.",
          });
        }
      });
    } else {
      callback(400, {
        error: "You must provide at least one field to update.",
      });
    }
  } else {
    callback(400, {
      error: "Error! Problem in your request.",
    });
  }
};
// DELETE Method - Check
handler._check.delete = (requestProperties, callback) => {
  // Check if the token id is valid
  const id =
    typeof requestProperties.queryStringObject.get("id") === "string" &&
    requestProperties.queryStringObject.get("id").trim().length === 20
      ? requestProperties.queryStringObject.get("id")
      : false;

  if (id) {
    // find the check in database
    data.read("checks", id, (err, checkData) => {
      if (!err && checkData) {
        const token =
          typeof requestProperties.headersObject.token === "string"
            ? requestProperties.headersObject.token
            : false;

        tokenHandler._token.verify(
          token,
          parseJSON(checkData).userPhone,
          (tokenIsValid) => {
            if (tokenIsValid) {
              // Delete the check data
              data.delete("checks", id, (err) => {
                if (!err) {
                  data.read(
                    "users",
                    parseJSON(checkData).userPhone,
                    (err, userData) => {
                      let userObject = parseJSON(userData);
                      if (!err && userData) {
                        let userChecks =
                          typeof userObject.checks === "object" &&
                          userObject.checks instanceof Array
                            ? userObject.checks
                            : [];

                        // Remove the corresponding checkId from userData of deleted checksData
                        let checkPosition = userChecks.indexOf(id);
                        if (checkPosition > -1) {
                          userChecks.splice(checkPosition, 1);
                          // Save the updated userData in database
                          userObject.checks = userChecks;
                          data.update(
                            "users",
                            userObject.phone,
                            userObject,
                            (err) => {
                              if (!err) {
                                callback(200, {
                                  error: "Check deleted successfully.",
                                });
                              } else {
                                callback(500, {
                                  error: "Error! Problem in the server side.",
                                });
                              }
                            }
                          );
                        } else {
                          callback(400, {
                            error:
                              "Error! The check you are trying to remove is not found in user data.",
                          });
                        }
                      } else {
                        callback(500, {
                          error: "Error! Problem in the server side.",
                        });
                      }
                    }
                  );
                } else {
                  callback(500, {
                    error: "Error! Problem in the server side.",
                  });
                }
              });
            } else {
              callback(403, {
                error: "Authentication Failure.",
              });
            }
          }
        );
      } else {
        callback(400, {
          error: "Error! Problem in the server side.",
        });
      }
    });
  } else {
    callback(400, {
      error: "Error! Problem in your request.",
    });
  }
};

// Module Export
module.exports = handler;
