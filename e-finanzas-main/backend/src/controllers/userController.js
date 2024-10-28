const bcrypt = require('bcrypt');
const connection = require('../models/database');

// Registro de usuario
// Registro de usuario
exports.register = (req, res) => {
    const { nombre, correo_electronico, contrasena } = req.body;

    try {
        // Encriptar la contraseña antes de guardarla
        const hashedPassword = bcrypt.hashSync(contrasena, 10);

        const query = 'INSERT INTO Usuarios (nombre, correo_electronico, contrasena, fecha_creacion) VALUES (?, ?, ?, NOW())';

        connection.query(query, [nombre, correo_electronico, hashedPassword], (err, results) => {
            if (err) {
                console.error('Database error:', err); // Log the specific database error
                return res.status(500).json({ error: 'Error al registrar el usuario' });
            }
            res.status(201).json({ message: 'Usuario registrado exitosamente' });
        });
    } catch (error) {
        console.error('Hashing error:', error); // Log if hashing throws an error
        return res.status(500).json({ error: 'Error interno en el servidor' });
    }
};



// Inicio de sesión de usuario
exports.login = (req, res) => {
    const { correo_electronico, contrasena } = req.body;  // Change 'password' to 'contrasena'

    const query = 'SELECT * FROM Usuarios WHERE correo_electronico = ?';

    connection.query(query, [correo_electronico], (err, results) => {
        if (err || results.length === 0) {
            return res.status(400).json({ error: 'Correo electrónico o contraseña incorrectos' });
        }

        const user = results[0];

        // Verificar la contraseña
        if (!bcrypt.compareSync(contrasena, user.contrasena)) {  // Compare with 'contrasena'
            return res.status(400).json({ error: 'Correo electrónico o contraseña incorrectos' });
        }

        // Si el login es exitoso, devolvemos el ID del usuario
        res.status(200).json({ message: 'Inicio de sesión exitoso', usuario_id: user.usuario_id });
    });
};

