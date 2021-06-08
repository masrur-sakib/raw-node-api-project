/*
 * Name/Title: Data storing library
 * Description: Handle data using node library
 * Developer: Masrur Sakib
 * Date: 08/06/2021
 */

// Dependencies
const fs = require("fs");
const path = require("path");

// Module Scaffolding
const lib = {};

// Base directory of the data folder
lib.basedir = path.join(__dirname, "/../.data/");

// Write data to file
lib.create = (dir, file, data, callback) => {
  // open file for writing
  fs.open(
    lib.basedir + dir + "/" + file + ".json",
    "wx",
    (err, fileDescriptor) => {
      if (!err && fileDescriptor) {
        //   convert Data to string
        const stringData = JSON.stringify(data);

        // Write data to file and then close it
        fs.writeFile(fileDescriptor, stringData, (err2) => {
          if (!err2) {
            fs.close(fileDescriptor, (err3) => {
              if (!err3) {
                callback(false);
              } else {
                callback("Error closing the new file.");
              }
            });
          } else {
            callback("Error writing to new file.");
          }
        });
      } else {
        callback("There was an error, file may already exists.");
      }
    }
  );
};

// Read data from file
lib.read = (dir, file, callback) => {
  fs.readFile(`${lib.basedir + dir}/${file}.json`, "utf8", (err, data) => {
    callback(err, data);
  });
};

// Update existing File
lib.update = (dir, file, data, callback) => {
  // file open for writing
  fs.open(`${lib.basedir + dir}/${file}.json`, "r+", (err, fileDescriptor) => {
    if (!err && fileDescriptor) {
      // Convert data to string
      const stringData = JSON.stringify(data);

      // Truncate the file (Remove existing content)
      fs.ftruncate(fileDescriptor, (err) => {
        if (!err) {
          // write to the file and then close the file
          fs.writeFile(fileDescriptor, stringData, (err) => {
            if (!err) {
              // Close the file
              fs.close(fileDescriptor, (err) => {
                if (!err) {
                  callback(false);
                } else {
                  callback("Error closing file");
                }
              });
            } else {
              callback("Error writing to the file");
            }
          });
        } else {
          callback("Error truncating file");
        }
      });
    } else {
      console.log("Error updating file, file may not exist.");
    }
  });
};

// Delete existing file
lib.delete = (dir, file, callback) => {
  // unlink file (Delete a file)
  fs.unlink(`${lib.basedir + dir}/${file}.json`, (err) => {
    if (!err) {
      callback(false);
    } else {
      callback("Error deleting file");
    }
  });
};

module.exports = lib;
