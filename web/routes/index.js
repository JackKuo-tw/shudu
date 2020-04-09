var express = require('express');
var router = express.Router();
var shudu = require("../../src/shudu.js");

var index = (req, res, next) => {
    var origin = req.body.origin;
    var converted = "請輸入欲轉換之文字...";
    // 限定長度不能超過 1 萬
    if (origin !== undefined && origin.length >0 && origin.length < 10000) {
        converted = shudu.convertText(origin);
    }
    res.render('index', { title: 'Shudu', converted: converted });
}

router.get('/', index);
router.post('/', index);


module.exports = router;
