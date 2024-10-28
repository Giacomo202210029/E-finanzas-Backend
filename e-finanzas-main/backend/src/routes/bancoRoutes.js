const express = require('express');
const router = express.Router();
const bancoController = require('../controllers/bancoController');

// Ruta para obtener todos los bancos
router.get('/bancos', bancoController.getAllBancos);

module.exports = router;
