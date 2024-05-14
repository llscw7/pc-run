const addon = require('./build/Release/demo2.node');

// addon.captureScreen('screenshot.png');
const res = addon.captureScreen(0,0,500,500);
console.log(res,'------')