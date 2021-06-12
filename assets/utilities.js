/*
 * Name/Title: Utilities
 * Description: Important utility functions
 * Developer: Masrur Sakib
 * Date: 10/06/2021
 */

// Dependencies
const crypto = require("crypto");
const environments = require("./environments");

// Module Scaffolding
const utilities = {};

// Parse JSON string to object
utilities.parseJSON = (jsonString) => {
  let output;

  try {
    output = JSON.parse(jsonString);
  } catch {
    output = {};
  }

  return output;
};

// Hash string
utilities.hash = (str) => {
  if (typeof str === "string" && str.length > 0) {
    let hash = crypto
      .createHmac("sha256", environments.secretKey)
      .update(str)
      .digest("hex");
    return hash;
  }
  return false;
};

// Export Module
module.exports = utilities;
