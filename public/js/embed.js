/**
 * Helper functions
 */
Requests = {
  QueryString(item) {
    let svalue = location.search.match(new RegExp("[\?\&]" + item + "=([^\&]*)(\&?)","i"));
    return svalue ? svalue[1] : svalue;
  }
}

/**
 * GET parameters
 */
const roomKey     = Requests.QueryString('room');
const showMessage = (Requests.QueryString('message') === 'true');
const fontSize    = Requests.QueryString('fontSize');
const background  = Requests.QueryString('background');
const color       = Requests.QueryString('color');

/**
 * DOM elements
 */
const countEle    = document.getElementById('count');
const messageEle  = document.getElementById('message');

/**
 * DOM manipulation
 */
setCount = (count) => {
  countEle.innerHTML = count;
}

setMessage = (message) => {
  if(showMessage) {
    messageEle.innerHTML = message;
  }
}

/**
 * Socket.io
 */
const ioHost = window.location.origin;
let socket = io(ioHost, {
  path: '',
  query: { roomKey: roomKey }
});

socket.on('roomData', (data) => {
  console.log(data);
  setTimeout(() => {
    setCount(data.count);
    setMessage(data.message);
  }, 1000);
});

socket.on('roomCount', (count) => {
  console.log(count);
  setCount(count);
});

socket.on('roomMessage', (message) => {
  console.log(message);
  setMessage(message);
});
