const OpenCC = require('opencc');
const pangu = require('./pangu');

module.exports = {
    getArgText() {
        const args = process.argv;
        if (args.length < 3) {
            console.log('\nUsage: node index.js 需要轉換的字串');
            process.exit();
        }

        return args[2];
    },

    async punctuate(origin, category = 'fullWidth') {
        // TODO: halfWidth
        let converted;
        if (category === 'fullWidth') {
            if (Array.isArray(origin)) {
                converted = origin.map(s => pangu.spacing(s))
            } else {
                converted = pangu.spacing(origin);
            }

        } else if (category === 'default') {
            converted = origin;
        } else if (category === 'halfWidth') {
            converted = origin;
        }
        return converted;
    },

    async convertText(text, conf = 's2twp.json') {
        // TODO: add other config
        // Load the default Simplified to Traditional (Taiwan Standard) config
        const openccInst = new OpenCC(conf);
        if (Array.isArray(text)) {
            converted = text.map(s => { return openccInst.convertPromise(s) });
        } else {
            converted = openccInst.convertPromise(text);
        }
        return converted;
    },
};