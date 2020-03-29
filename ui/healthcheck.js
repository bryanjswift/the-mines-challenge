#!/usr/bin/env node
const http = require('http');

// ************************************************************************** *
// This runs in the HEALTHCHECK of the Ui.Dockerfile. It is executed directly *
// without the use of any transpilers, so it must be "stock" JS and rely only *
// on `node` APIs.                                                            *
// ************************************************************************** *

const options = {
  host: 'localhost',
  method: 'HEAD',
  port: '3000',
  timeout: 500,
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  if (res.statusCode == 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

req.on('error', (err) => {
  console.warn(`ERROR: ${err.name}(${err.message})`);
  process.exit(1);
});

req.end();
