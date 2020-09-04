const express = require('express');
const cors = require('cors')
const index = require('./controllers/index');
const translate = require('./controllers/translate');

const router = express.Router();

// index
router.get('/', index.index);

// addon
router.get('/addon', index.addon);

// translate
router.post('/json', cors(), translate.translate);

module.exports = router;