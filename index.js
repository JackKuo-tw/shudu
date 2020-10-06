'use strict';

const shudu = require('./src/shudu.js');

var origin = shudu.getArgText(); // Get text for stdin
shudu.convertText(origin).then(converted => {
    shudu.punctuate(converted).then((converted) => {
        console.log(`\n原始: ${origin}\n轉換: ${converted}`);
    });
});
