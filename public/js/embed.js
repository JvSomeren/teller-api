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
const roomKey         = Requests.QueryString('room');
const showMessage     = (Requests.QueryString('message') === 'true');
const fontSizeCount   = Requests.QueryString('fontSizeCount');
const fontSizeMessage = Requests.QueryString('fontSizeMessage');
const background      = Requests.QueryString('background');
const color           = Requests.QueryString('color');

/**
 * DOM elements
 */
const bodyEle     = document.querySelector('body');
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

if(fontSizeCount) {
  countEle.style.fontSize = fontSizeCount + 'vh';
}

if(fontSizeMessage) {
  messageEle.style.fontSize = fontSizeMessage + 'vh';
}

if(background) {
  bodyEle.style.background = '#' + background;
}

if(color) {
  bodyEle.style.color = '#' + color;
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
  setCount(data.count);
  setMessage(data.message);
});

socket.on('roomCount', (count) => {
  setCount(count);
});

socket.on('roomMessage', (message) => {
  setMessage(message);
});
