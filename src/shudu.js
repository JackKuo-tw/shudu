'use strict'

var pangu = require("./pangu");
var OpenCC = require('opencc');

function getArgText() {
    var args = process.argv;
    if (args.length < 3) {
        console.log(`\nUsage: node index.js 需要轉換的字串`);
        process.exit()
    } else {
        return args[2];
    }
}

function convertText(origin, conf='s2twp.json') {
    // TODO: add other config
    // Load the default Simplified to Traditional (Taiwan Standard) config
    var openccInst = new OpenCC(conf);
    // Sync API
    var converted = openccInst.convertSync(origin);
    converted = pangu.spacing(converted);
    return converted;
}

exports.getArgText = getArgText;
exports.convertText = convertText;
