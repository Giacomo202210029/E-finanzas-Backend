const connection = require('../models/database');

// Obtener todos los bancos disponibles
exports.getAllBancos = (req, res) => {
    const query = 'SELECT * FROM Bancos';

    connection.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener los bancos' });
        }
        res.status(200).json(results);
    });
};

