const express = require('express');
const ParseServer = require('parse-server').ParseServer;
const app = express();
const appId = 'myAppId';
const masterKey = 'myMasterKey'; // Keep this key secret!
const serverURL = 'http://localhost:1337/parse';

const api = new ParseServer({
  databaseURI: 'mongodb://localhost:27017/dev', // Connection string for your MongoDB database
  cloud: './cloud/main.js', // Path to your Cloud Code
  appId,
  masterKey,
  fileKey: 'optionalFileKey',
  serverURL, // Don't forget to change to https if needed
  enableExpressErrorHandler: true,
});

// Serve the Parse API on the /parse URL prefix
app.use('/parse', api);

app.use((error, req, res, next) => {
  console.log(error);
});

module.exports = {
  app,
  appId,
  masterKey,
  serverURL,
};
