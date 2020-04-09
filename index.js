'use strict'
var pangu = require("./src/pangu");
var OpenCC = require('opencc');
var shudu = require("./src/shudu.js");

// Load the default Simplified to Traditional config
var opencc = new OpenCC('s2twp.json');

// Sync API
var origin = shudu.origin;
var converted = opencc.convertSync(origin);
converted = pangu.spacing(converted);

console.log(`\n原始: ${origin}\n轉換: ${converted}`)
