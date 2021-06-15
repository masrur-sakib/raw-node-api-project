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
};

environments.production = {
  envName: "production",
  port: 5000,
  secretKey: "fjierhuiafnewufhdv",
  maxChecks: 5,
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
