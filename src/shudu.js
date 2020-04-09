'use strict'

var args = process.argv;
var origin = "";
if (args.length < 3) {
    console.log(`\nUsage: node index.js 需要轉換的字串`);
    process.exit()
} else {
    origin = args[2];
}

exports.origin = origin;
