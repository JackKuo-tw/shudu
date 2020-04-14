const OpenCC = require('opencc');
const pangu = require('./pangu');

function getArgText() {
    const args = process.argv;
    if (args.length < 3) {
        console.log('\nUsage: node index.js 需要轉換的字串');
        process.exit();
    }

    return args[2];
}

function convertText(origin, conf = 's2twp.json') {
    // TODO: add other config
    // Load the default Simplified to Traditional (Taiwan Standard) config
    const openccInst = new OpenCC(conf);
    // Sync API
    let converted = openccInst.convertSync(origin);
    converted = pangu.spacing(converted);
    return converted;
}

module.exports = {
    getArgText, convertText,
};
