const express = require('express');
const shudu = require('../../src/shudu.js');
const cors = require('cors')

const router = express.Router();
router.get('/', async(req, res) => {
    res.render('index');
});

router.post('/json', cors(), async(req, res) => {
    const origin = req.body.origin;
    const punctuation = (req.body.punctuation === 'undefined') ? 'fullWidth' : req.body.punctuation;
    // 限定長度不能超過 10 萬
    if (origin == undefined || origin.length <= 0 || origin.length > 100000) return res.json({});

    if (Array.isArray(origin)) {
        shudu.convertText(origin).then(converted => {
            Promise.all(converted).then(r => {
                shudu.punctuate(r, punctuation).then((r) => {
                    return Promise.all(r).then(r => { return res.json({ converted: r }); });
                });
            });
        });
    } else {
        shudu.convertText(origin).then(converted => {
            shudu.punctuate(converted, punctuation).then((converted) => {
                return res.json({ converted });
            })
        });
    };
});

module.exports = router;