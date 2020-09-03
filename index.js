'use strict';

var shudu = require("./src/shudu.js");

// get text from stdin
var origin = shudu.getArgText();
var converted = shudu.convertText(origin);

console.log(`\n原始: ${origin}\n轉換: ${converted}`);