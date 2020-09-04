const shudu = require('../../src/shudu');

function selectConf(conf) {
    switch (conf) {
        case 'tw2sp':
            return 'tw2sp.json';
        default:
            return 's2twp.json';
    }
};

module.exports = {

    async translate(req, res) {
        const origin = req.body.origin;
        const punctuation = (req.body.punctuation === 'undefined') ? 'fullWidth' : req.body.punctuation;
        let convertConf = selectConf(req.body.translation || 's2twp');

        if (origin == undefined || origin.length <= 0) return res.json({});

        if (Array.isArray(origin)) {
            shudu.convertText(origin, convertConf).then(converted => {
                Promise.all(converted).then(r => {
                    shudu.punctuate(r, punctuation).then((r) => {
                        return Promise.all(r).then(r => { return res.json({ converted: r }); });
                    });
                });
            });
        } else {
            shudu.convertText(origin, convertConf).then(converted => {
                shudu.punctuate(converted, punctuation).then((converted) => {
                    return res.json({ converted });
                })
            });
        };
    },

};