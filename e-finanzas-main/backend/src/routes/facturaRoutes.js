const express = require('express');
const router = express.Router();
const facturaController = require('../controllers/facturaController');

// Rutas para manejar las facturas
router.get('/user', facturaController.getFacturasByUser);  // Obtener facturas del usuario
router.post('/', facturaController.addFactura);  // Añadir nueva factura // Añadir nueva factura
router.get('/calculate-tcea-total', facturaController.calculateTCEATotal);

module.exports = router;
