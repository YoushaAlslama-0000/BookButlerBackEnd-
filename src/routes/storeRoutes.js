const express = require('express');
const router = express.Router();
const { getStoreConfig, buildDirectWhatsAppOrder } = require('../controllers/storeController');

router.get('/config', getStoreConfig);
router.post('/whatsapp-order-preview', buildDirectWhatsAppOrder);

module.exports = router;
