const addon = require('./build/Release/screen_capture.node');

// addon.captureScreen('screenshot.png');
const res = addon.captureScreen(0,0,500,500);
console.log(res,'------')