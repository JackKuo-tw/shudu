const express = require('express');
const shudu = require('../../src/shudu.js');

const router = express.Router();
router.get('/', (req, res) => {
    res.render('index');
});

router.post('/json', (req, res) => {
    const origin = req.body.origin;
    let converted = '';
    // 限定長度不能超過 1 萬
    if (origin !== undefined && origin.length > 0 && origin.length < 10000) {
        converted = shudu.convertText(origin);
    }
    res.json({ converted });
});

module.exports = router;
