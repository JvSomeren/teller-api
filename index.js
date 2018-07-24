var express = require('express')
var app = express()
var path = require('path')
var fs = require('fs')
var server = require('http').createServer(app)
var io = require('socket.io')(server)
var redis = require('redis')
var cors = require('cors')
var port = process.env.PORT || 3000

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

// CORS middleware
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  return next();
});

app.use(express.static(path.join(__dirname, 'public')));

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
