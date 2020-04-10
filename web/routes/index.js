'use strict';

const express = require('express');
const router = express.Router();
const shudu = require("../../src/shudu.js");

router.get('/', (req, res, next) => {
    var converted = "請輸入欲轉換之文字...";
    res.render('index', { title: 'Shudu 舒讀', converted: converted });
});

router.post('/json', (req, res, next) => {
    const origin = req.body.origin;
    var converted = "";
    // 限定長度不能超過 1 萬
    if (origin !== undefined && origin.length >0 && origin.length < 10000) {
        converted = shudu.convertText(origin);
    }
    res.json({converted: converted});
});

module.exports = router;
