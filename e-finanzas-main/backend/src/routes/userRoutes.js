const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Rutas para manejar el registro e inicio de sesión
router.post('/register', userController.register);  // Ruta para registrar un nuevo usuario
router.post('/login', userController.login);  // Ruta para iniciar sesión

module.exports = router;
