const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const fs = require('fs');
const config = require('./config');

// HTTP SERVER INSTANTIATION
const httpServer = http.createServer((req, res) => {
  unifiedServer(req, res);
});

// START HTTP SERVER
httpServer.listen(config.httpPort, () => {
  console.log(`Server is listening on HTTP Port ${config.httpPort} in ${config.envName} now...`);
});

// HTTPS SERVER INSTANTIATION
const httpServerOptions = {
  'key': fs.readFileSync('./https/key.pem'), 
  'cert': fs.readFileSync('./https/cert.pem')
};

const httpsServer = https.createServer(httpServerOptions, (req, res) => {
  unifiedServer(req, res);
});

// START HTTPS SERVER
httpsServer.listen(config.httpsPort, () => {
  console.log(`Server is listening on HTTPS Port ${config.httpsPort} in ${config.envName} now...`);
});


const handlers = {};

handlers.welcome = (data, callback) => {
  callback(200, { message: 'Hello there... Welcome Aboard..' }) ;
}

handlers.notFound = (data, callback) => {
  callback(404) ;
}

const router = {
  'hello': handlers.welcome,
};

const unifiedServer = (req, res) => {
  // PARSE AND EXTRACT PATH
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, "");  
  
  // GETING REQUEST METHOD
  const method = req.method.toLowerCase();

  // GETTING QUERYSTRING
  const queryStringObj = parsedUrl.query;

  // GETTING HEADERS
  const headers = req.headers;

  // GETTING PAYLOAD
  const decoder = new StringDecoder("utf-8");
  let buffer = "";
  req.on('data', data => {
      buffer += decoder.write(data);
  });
  req.on('end', () => {
    buffer += decoder.end();
    const chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;
    const data = {
      trimmedPath,
      queryStringObj,
      method,
      headers,
      buffer
    };
    chosenHandler(data, (statusCode, payload) => {
      statusCode = typeof(statusCode) === 'number' ? statusCode : 200;
      payload = typeof(payload) === 'object' ? payload : {};
      const payloadString = JSON.stringify(payload);
      res.setHeader('Content-type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);
    });
  });
};

