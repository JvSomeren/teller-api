var express = require('express')
var app = express()
var jwt = require('jsonwebtoken')
var path = require('path')
var fs = require('fs')
var server = require('http').createServer(app)
var io = require('socket.io')(server)
var redis = require('redis')
var cors = require('cors')
require('dotenv').config()
var port = process.env.PORT || 3000

if (!process.env.AUTH0_DOMAIN || !process.env.AUTH0_AUDIENCE) {
  throw 'Make sure you have AUTH0_DOMAIN, and AUTH0_AUDIENCE in your .env file';
}

/**
 * Configure CORS
 */
const whitelist = [
  'http://localhost:8080',
  '/\.ssr-leiden\.nl$',
  '/\.joostvansomeren\.nl$'
];
const corsOptions = {
  orign: whitelist,
  optionsSuccessStatus: 200,
  credentials: true,
}

app.use(cors(corsOptions));

server.listen(port, () => {
  console.log('Server listening at port %d', port);
});

app.use(express.static(path.join(__dirname, 'public')));

/**
 * JWT token validation
 */
checktoken = (token) => {
  // The public key as obtained from auth0: https://manage.auth0.com/#/applications/H9CZw-5MNp9YlG6g_zAGOaoZpdoHecfo/settings
  var key = "-----BEGIN CERTIFICATE-----\nMIIDBzCCAe+gAwIBAgIJLuXMd7+aKcusMA0GCSqGSIb3DQEBCwUAMCExHzAdBgNVBAMTFmp2c29tZXJlbi5ldS5hdXRoMC5jb20wHhcNMTcwNTE1MjMwNDMxWhcNMzEwMTIyMjMwNDMxWjAhMR8wHQYDVQQDExZqdnNvbWVyZW4uZXUuYXV0aDAuY29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwTnGO6FJ8d8DydkxQ0JzpVqKGF5txGl/Jjhw9i7Tr0tW7IkUxnq79ILCPNtyWAGFPAHAZWCz2/QsfjrqOe/fOPlw8iOvGhigXWohJHnudXNUJCDWwyTV4NFi34QpYws4+b5+2QEpot5w1M2yAEfffztPZ6CQ5soB+JE4j+naer9BmJhs1GwrfVQNbsJPkK5R+UJW+WLQETWUnMNZz7atnY7EpMKg1ydw4AlL2liaWyst2zvZzsFQNekr3JGlneuKskm5G4DqO+Zqnv1Qe3Y85VoguFCaCwQNDHzLDF4l2TqSyvizYOPjOQyO4+1IxisM4kQw8zePt/g+W5c1rBZ0EQIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBR8tjmVmrAZVAVeR6yf2i3wx7s/dTAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEBAFIVSGOSGCjHHrHyWwE/ipNTHcrCiQcjtYaBlgwvrcFtQ7NRtyJzsmUjWN91Ybc5IVJsuSMiaAmvIEuaCW8GAE7e+YzP895rjakavbi8T4YETnEiwp5jWIlpIycX1cPwakaLVA99Dh5P/Pa4AeaAKVbUSe6cHXZTdbhmd26vx+64YXHxYC8mJi7zvEvJw8ch28/ACo7Prm70AyN+TYNcLAYih7MpKGpVYNAVQ0wphN4FA+G8w5sGDaJaGl7DnjRxomNdUWz9PX6+htQwfvO5870AqU/ewqWlVceTjsRK7YlPQF5m5KbWbpxC4o3uR2/C7gM3mYGvPUU7a8BJd8a2+5k=\n-----END CERTIFICATE-----";
  // Audience is the AUTH_CONFIG.clientId as defined by auth0 (can also be found in client side code)
  // Issuer must be this specific auth0 domain
  return jwt.verify(token, key, {algorithms: ['RS256'], issuer: `https://${process.env.AUTH0_DOMAIN}/`, audience: `${process.env.AUTH0_AUDIENCE}`}, (err, decoded) => {
    if(err) return false;

    return decoded;
  });
}

/**
});


// socket.io `view` namespace
var ioView = io
  .of('/view')
  .on('connection', (socket) => {
    let room = 'ssr';

    socket.join(room);
    
    // socket emit current count of room
    // socket emit current history of room
    // socket emit current message of room
  });

// socket.io `count` namespace
var ioCount = io
  .of('/count')
  .on('connection', (socket) => {
    let room = 'ssr';

    socket.join(room);

    // socket logic functions
  });
