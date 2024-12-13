const fs = require('fs');
const path = require('path');

// Path to log file
const logFilePath = path.join(__dirname, '../logs/log.txt');

// Function to format the timestamp
const formatTimestamp = () => {
  const date = new Date();
  const formattedDate = date.toLocaleDateString('en-US');  // Format: MM/DD/YYYY
  const formattedTime = date.toLocaleTimeString('en-US', { hour12: false }); // Format: HH:mm:ss (24-hour format)
  return `[${formattedDate} ${formattedTime}]`;
};

// Function to write logs to a file
const log = (methodName, messageType, statusCode, message) => {
  const timeStamp = formatTimestamp();  // Get the formatted timestamp
  const logMessage = `${timeStamp} - [${methodName}] [${messageType}] [${statusCode}] ${message}\n`;

  // Write the log to the log file
  fs.appendFile(logFilePath, logMessage, (err) => {
    if (err) {
      console.error('Error writing to log file:', err);
    }
  });

  // Optionally, you can remove this console.log if you don't need to display it on console
  console.log(logMessage);
};

module.exports = log;
