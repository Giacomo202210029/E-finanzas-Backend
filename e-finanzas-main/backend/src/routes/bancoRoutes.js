const express = require('express');
const router = express.Router();
const bancoController = require('../controllers/bancoController');

// Ruta para obtener todos los bancos
router.get('/', bancoController.getAllBancos);

router.get('/:banco_id/tasa-interes', bancoController.getBancoTEA);
module.exports = router;
