var express = require('express')
var app = express()
var path = require('path')
var fs = require('fs')
var server = require('http').createServer(app)
var io = require('socket.io')(server)
var redis = require('redis')
var port = process.env.PORT || 3000

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
