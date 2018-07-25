var express = require('express')
var app = express()
var jwt = require('jsonwebtoken')
var path = require('path')
var fs = require('fs')
var server = require('http').createServer(app)
var io = require('socket.io')(server)
var redis = require('redis')
var cors = require('cors')
const {promisify} = require('util')
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
 * Shitty log function
 */
logCounter = async (key) => {
  const res = await hgetAsync(key, fields[0]);

  let log_file = './public/logs/' + key + '.log',
      log_time_value = Date.now(),
      log_time_date = new Date(),
      log_data = res + ' ' + log_time_value + ' ' + log_time_date + '\n';

  fs.appendFile(log_file, log_data, (err) => {
    if(err) throw err;
  });
}

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
 * Redis client
 */
const fields = ['count', 'message', 'history'];
var rClient = redis.createClient();
rClient.on('error', (err) => {
  console.log('Error ' + err);
});
/**
 * Create async/await redis functions
 */
const hgetAsync     = promisify(rClient.hget).bind(rClient);
const hgetallAsync  = promisify(rClient.hgetall).bind(rClient);
const hincrbyAsync  = promisify(rClient.hincrby).bind(rClient);
const hsetAsync     = promisify(rClient.hset).bind(rClient);

/**
 * Room general logic functions
 */
prepareRoom = (roomKey) => {
  fields.forEach((val, index) => {
    if(index === 0)
      rClient.hsetnx(roomKey, [val, 0]);
    else if(index === 1)
      rClient.hsetnx(roomKey, [val, '']);
    else if(index === 2)
      rClient.hsetnx(roomKey, [val, '']);
  });
}

emitRoomData = async (s, key) => {
  const res = await hgetallAsync(key);

  if(res === null) {
    prepareRoom(key);
    emitRoomData(s, key);
  } else {
    s.emit('roomData', res);
  }
}

/**
 * Room count logic functions
 */
broadcastRoomCount = async (s, key) => {
  const res = await hgetAsync(key, fields[0]);

  s.broadcast.emit('roomCount', res);
}

roomCountIncrBy = (key, incrby) => {
  hincrbyAsync(key, fields[0], incrby);

  logCounter(key);
}

roomCountSet = (key, val) => {
  hsetAsync(key, fields[0], val);

  logCounter(key);
}

/**
 * Room message logic functions
 */
broadcastRoomMessage = async (s, key) => {
  const res = await hgetAsync(key, fields[1]);

  s.broadcast.emit('roomMessage', res)
}

roomMessageSet = (key, val) => {
  hsetAsync(key, fields[1], val);
}

/**
 * 
 * Socket.io interface
 * 
 */

/**
 * Authentication middleware
 */
io.use((socket, next) => {
  if(socket.handshake.query) {
    if(socket.handshake.query.roomKey) {
      socket.roomKey = socket.handshake.query.roomKey;
      socket.join(socket.roomKey);
    }

    if(socket.handshake.query.token && checktoken(socket.handshake.query.token)) {
      socket.authenticated = true;
      next();
    } else {
      socket.authenticated = false;
      next();
    }
  } else {
    next();
  }
})
/**
 * Socket request handlers
 */
.on('connection', (socket) => {
  socket.on('room join', (roomKey) => {
    socket.join(roomKey);
  });
  
  /**
   * Room specific handlers
   */
  if(socket.roomKey) {
    const roomKey = socket.roomKey;

    emitRoomData(socket, roomKey);
    
    socket.on('room leave', () => {
      socket.leave(roomKey);
    });

    socket.on('room get', () => {
      emitRoomData(socket, roomKey);
    });

    /**
     * Authenticated user handlers
     */
    if(socket.authenticated) {
      /**
       * Room count handlers
       */
      socket.on('count increase', () => {
        // update history
        roomCountIncrBy(roomKey, 1);
        
        broadcastRoomCount(socket, roomKey);
      });
  
      socket.on('count decrease', () => {
        // update history
        roomCountIncrBy(roomKey, -1);
        
        broadcastRoomCount(socket, roomKey);
      });
  
      socket.on('count set', (count) => {
        // update history
        roomCountSet(roomKey, count);
  
        broadcastRoomCount(socket, roomKey);
      });
  
      socket.on('count reset', () => {
        // update history
        roomCountSet(roomKey, 0);
  
        broadcastRoomCount(socket, roomKey);
      });
  
      /**
       * Room message handlers
       */
      socket.on('message set', (message) => {
        roomMessageSet(roomKey, message);
  
        broadcastRoomMessage(socket, roomKey);
      });
  
      socket.on('message clear', () => {
        roomMessageSet(roomKey, '');
  
        broadcastRoomMessage(socket, roomKey);
      });
    
      /**
       * Room history handlers
       */
    }
  }
});
