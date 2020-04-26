const express = require('express');
const shudu = require('../../src/shudu.js');

const router = express.Router();
router.get('/', (req, res) => {
    res.render('index');
});

router.post('/json', (req, res) => {
    const origin = req.body.origin;
    const punctuation = (req.body.punctuation === 'undefined') ? 'fullWidth' : req.body.punctuation;
    let converted = '';
    // 限定長度不能超過 10 萬
    if (origin !== undefined && origin.length > 0 && origin.length < 100000) {
        converted = shudu.convertText(origin);
        converted = shudu.punctuate(converted, punctuation);
    }
    res.json({ converted });
});

module.exports = router;
