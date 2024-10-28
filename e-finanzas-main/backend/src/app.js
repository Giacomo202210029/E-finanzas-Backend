const express = require('express');
const cors = require('cors');  // Para permitir CORS

const app = express();

// Importar rutas
const facturaRoutes = require('./routes/facturaRoutes');
const userRoutes = require('./routes/userRoutes');  // Si tienes rutas de usuario
const bancoRoutes = require('./routes/bancoRoutes');  // Si tienes rutas de bancos

// Middleware
app.use(cors());  // Habilitar CORS para todas las rutas
app.use(express.json());  // Parsear JSON

// Rutas
app.use('/api/facturas', facturaRoutes);
app.use('/api/usuarios', userRoutes);  // Ajusta esto si tienes usuarios
app.use('/api/bancos', bancoRoutes);  // Ajusta esto si tienes bancos

// Ruta por defecto para rutas no encontradas
app.use((req, res, next) => {
    res.status(404).json({ message: "Ruta no encontrada" });
});

// Servidor escuchando
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
