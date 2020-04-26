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

function punctuate(origin, category = 'fullWidth') {
    // TODO: halfWidth
    let converted;
    if (category === 'fullWidth') {
        converted = pangu.spacing(origin);
    } else if (category === 'default') {
        converted = origin;
    } else if (category === 'halfWidth') {
        converted = origin;
    }
    return converted;
}

function convertText(origin, conf = 's2twp.json') {
    // TODO: add other config
    // Load the default Simplified to Traditional (Taiwan Standard) config
    const openccInst = new OpenCC(conf);
    // Sync API
    return openccInst.convertSync(origin);
}

module.exports = {
    getArgText, convertText, punctuate,
};
