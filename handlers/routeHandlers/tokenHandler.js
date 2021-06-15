/*
 * Name/Title: Token Handler
 * Description: Handler to handle token related routes
 * Developer: Masrur Sakib
 * Date: 12/06/2021
 */

// Dependencies
const data = require("../../lib/data");
const { hash } = require("../../assets/utilities");
const { parseJSON } = require("../../assets/utilities");
const { createRandomString } = require("../../assets/utilities");

// Module Scaffolding
const handler = {};

handler.tokenHandler = (requestProperties, callback) => {
  const acceptedMethods = ["get", "post", "put", "delete"];
  if (acceptedMethods.indexOf(requestProperties.method) > -1) {
    handler._token[requestProperties.method](requestProperties, callback);
  } else {
    callback(405);
  }
};

handler._token = {};

// POST Method - Token
handler._token.post = (requestProperties, callback) => {
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

  if (phone && password) {
    data.read("users", phone, (err, userData) => {
      let hashedPassword = hash(password);
      if (hashedPassword === parseJSON(userData).password) {
        let tokenId = createRandomString(20);
        let expires = Date.now() + 60 * 60 * 1000;
        let tokenObject = {
          phone,
          id: tokenId,
          expires,
        };

        // Store the token
        data.create("tokens", tokenId, tokenObject, (err) => {
          if (!err) {
            callback(200, tokenObject);
          } else {
            callback(500, {
              error: "Error! Problem in server side.",
            });
          }
        });
      } else {
        callback(400, {
          error: "Invalid Password",
        });
      }
    });
  } else {
    callback(400, {
      error: "Error! Problem in server side.",
    });
  }
};
// GET Method - Token
handler._token.get = (requestProperties, callback) => {
  // Check if the token id is valid
  const id =
    typeof requestProperties.queryStringObject.get("id") === "string" &&
    requestProperties.queryStringObject.get("id").trim().length === 20
      ? requestProperties.queryStringObject.get("id")
      : false;

  if (id) {
    // Fine the token
    data.read("tokens", id, (err, tokenData) => {
      const token = { ...parseJSON(tokenData) };
      if (!err && token) {
        callback(200, token);
      } else {
        callback(404, {
          error: "Requested token not found (2)",
        });
      }
    });
  } else {
    callback(404, {
      error: "Requested token not found (1)",
    });
  }
};
// PUT Method - Token
handler._token.put = (requestProperties, callback) => {
  const id =
    typeof requestProperties.body.id === "string" &&
    requestProperties.body.id.trim().length === 20
      ? requestProperties.body.id
      : false;

  const extend =
    typeof requestProperties.body.extend === "boolean" &&
    requestProperties.body.extend === true
      ? requestProperties.body.extend
      : false;

  if (id && extend) {
    data.read("tokens", id, (err, tokenData) => {
      let tokenObject = parseJSON(tokenData);
      if (tokenObject.expires > Date.now()) {
        tokenObject.expires = Date.now() + 60 * 60 * 1000;
        // Store the updated token
        data.update("tokens", id, tokenObject, (err) => {
          if (!err) {
            callback(200, {
              error: "Token updated successfully.",
            });
          } else {
            callback(500, {
              error: "Error! Problem in server side.",
            });
          }
        });
      } else {
        callback(400, {
          error: "Token already expired.",
        });
      }
    });
  } else {
    callback(400, {
      error: "Error! Problem in your request.",
    });
  }
};
// DELETE Method - Token
handler._token.delete = (requestProperties, callback) => {
  // Check if the token is valid
  const id =
    typeof requestProperties.queryStringObject.get("id") === "string" &&
    requestProperties.queryStringObject.get("id").trim().length === 20
      ? requestProperties.queryStringObject.get("id")
      : false;

  if (id) {
    // Check if the user exists or not
    data.read("tokens", id, (err, tokenData) => {
      if (!err && tokenData) {
        data.delete("tokens", id, (err) => {
          if (!err) {
            callback(200, {
              message: "Token deleted successfully.",
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
    callback(400, {
      error: "Error! Problem in your request.",
    });
  }
};

// Token Verification Function - Token
handler._token.verify = (id, phone, callback) => {
  data.read("tokens", id, (err, tokenData) => {
    if (!err && tokenData) {
      if (
        parseJSON(tokenData).phone === phone &&
        parseJSON(tokenData).expires > Date.now()
      ) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};

module.exports = handler;
