/*
 * Name/Title: Handle Request Response
 * Description: Handle Request and Response
 * Developer: Masrur Sakib
 * Date: 05/06/2021
 */

// Dependencies
const url = require("url");
const { StringDecoder } = require("string_decoder");
const routes = require("../routes");
const {
  notFoundHandler,
} = require("../handlers/routeHandlers/notFoundHandler");

// App Object - Module Scaffolding
const handler = {};

// Function that handles Request & Response
handler.handleReqRes = (req, res) => {
  // Handle Request
  baseURL = req.protocol + "://" + req.headers.host + "/";
  const parsedUrl = new URL(req.url, baseURL);
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, "");
  const method = req.method.toLowerCase();
  const queryStringObject = parsedUrl.searchParams;
  const headersObject = req.headers;

  const requestProperties = {
    parsedUrl,
    path,
    trimmedPath,
    method,
    queryStringObject,
    headersObject,
  };

  // Decode the requested body
  const decoder = new StringDecoder("utf-8");
  let realData = "";

  // routes
  const choosenHandler = routes[trimmedPath]
    ? routes[trimmedPath]
    : notFoundHandler;

  req.on("data", (buffer) => {
    realData += decoder.write(buffer);
  });
  req.on("end", () => {
    realData += decoder.end();

    choosenHandler(requestProperties, (statusCode, payload) => {
      statusCode = typeof statusCode === "number" ? statusCode : 500;
      payload = typeof payload === "object" ? payload : {};

      const payloadString = JSON.stringify(payload);

      // return the final response
      res.setHeader("Content-Type", "application/json");
      res.writeHead(statusCode);
      res.end(payloadString);
    });
  });
};

module.exports = handler;
