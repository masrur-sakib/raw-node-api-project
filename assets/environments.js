/*
 * Name/Title: Environments
 * Description: Handle all environment variables & constants
 * Developer: Masrur Sakib
 * Date: 08/06/2021
 */

// Dependencies

// Module Scaffolding
const environments = {};

environments.staging = {
  envName: "staging",
  port: 3000,
  secretKey: "asakddhsjadhudhedh",
  maxChecks: 5,
  twilio: {
    // fromPhone: "+17816616058",
    fromPhone: "+13212653114",
    accountSid: "AC5d90c6893c5cbc5c83c3b21973976afb",
    authToken: "9870449529b0fd7d85a334ae02c516ae",
  },
};

environments.production = {
  envName: "production",
  port: 5000,
  secretKey: "fjierhuiafnewufhdv",
  maxChecks: 5,
  twilio: {
    fromPhone: "+15017122661",
    accountSid: "AC5d90c6893c5cbc5c83c3b21973976afb",
    authToken: "9870449529b0fd7d85a334ae02c516ae",
  },
};

// Determine which environment was passed
const currentEnvironment =
  typeof process.env.NODE_ENV === "string" ? process.env.NODE_ENV : "staging";

//   Export corresponding environment object
const environmentToExport =
  typeof environments[currentEnvironment] === "object"
    ? environments[currentEnvironment]
    : environments.staging;

// Export Module
module.exports = environmentToExport;
