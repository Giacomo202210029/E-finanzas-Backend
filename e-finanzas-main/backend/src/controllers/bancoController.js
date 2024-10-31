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

// Obtener el TEA de un banco específico por banco_id
exports.getBancoTEA = (req, res) => {
    const bancoId = req.params.banco_id;
    const query = 'SELECT tasa_interes FROM Bancos WHERE banco_id = ?';

    connection.query(query, [bancoId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener la tasa de interés del banco' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Banco no encontrado' });
        }

        res.status(200).json({ tasa_interes: results[0].tasa_interes });
    });
};