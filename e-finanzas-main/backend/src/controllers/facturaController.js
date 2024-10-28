
const connection = require('../models/database');

// Obtener todas las facturas de un usuario (simple, sin autenticación)
// Obtener todas las facturas de un usuario
exports.getFacturasByUser = (req, res) => {
    const userId = req.query.usuario_id;  // Retrieve `usuario_id` from query parameters
    console.log('Fetching invoices for user:', userId); // Log for debugging

    const query = 'SELECT * FROM Facturas WHERE usuario_id = ?';

    connection.query(query, [userId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener facturas del usuario' });
        }
        res.status(200).json(results);
    });
};

exports.calculateTCEATotal = (req, res) => {
    const userId = req.query.usuario_id;  // Se obtiene el usuario_id desde los parámetros de consulta
    console.log('Calculando TCEA total para el usuario:', userId);

    // Primero, obtenemos todas las facturas del usuario
    const query = 'SELECT valor_a_entregar, valor_recibido, tcea FROM Facturas WHERE usuario_id = ?';
    connection.query(query, [userId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener facturas del usuario para calcular la TCEA total' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'No se encontraron facturas para este usuario' });
        }

        // Inicializamos los acumuladores
        let sumaValorEntregadoPorTCEA = 0;
        let sumaValorRecibido = 0;

        results.forEach((factura, index) => {
            const valorEntregado = parseFloat(factura.valor_a_entregar) || 0;
            const valorRecibido = parseFloat(factura.valor_recibido) || 0;
            const tcea = parseFloat(factura.tcea) || 0;

            console.log(`Factura #${index + 1}`);
            console.log(`Valor a entregar: ${valorEntregado}`);
            console.log(`Valor recibido: ${valorRecibido}`);
            console.log(`TCEA: ${tcea}`);

            // Multiplicación para la suma de valor entregado por TCEA
            const valorEntregadoPorTCEA = valorEntregado * (tcea / 100);
            console.log(`valorEntregado * (tcea / 100): ${valorEntregado} * ${tcea / 100} = ${valorEntregadoPorTCEA}`);

            // Acumular los valores en las variables de suma
            sumaValorEntregadoPorTCEA += valorEntregadoPorTCEA;
            sumaValorRecibido += valorRecibido;

            console.log(`Suma Valor Entregado por TCEA (acumulado): ${sumaValorEntregadoPorTCEA}`);
            console.log(`Suma Valor Recibido (acumulado): ${sumaValorRecibido}`);
        });

        // Evitar división por cero
        if (sumaValorRecibido === 0) {
            console.error('Error en el cálculo: la suma de valores recibidos es cero');
            return res.status(400).json({ error: 'Error en el cálculo: la suma de valores recibidos es cero' });
        }

        // Calcular la TCEA total final
        const tceaTotal = (sumaValorEntregadoPorTCEA / sumaValorRecibido) * 100;
        console.log('TCEA Total calculada:', tceaTotal);

        res.status(200).json({ tcea_total: tceaTotal });
    });
};



// Añadir una nueva factura con cálculos
exports.addFactura = (req, res) => {
    const {
        usuario_id, banco_id, emisor, numero_documento, fecha_emision, fecha_vencimiento,
        fecha_descuento, monto_nominal
    } = req.body;

    // Obtener la tasa de interés y comisión del banco seleccionado
    const queryBanco = 'SELECT tasa_interes, comision FROM Bancos WHERE banco_id = ?';
    connection.query(queryBanco, [banco_id], (err, bancoResults) => {
        if (err || bancoResults.length === 0) {
            return res.status(500).json({ error: 'Error al obtener la tasa del banco' });
        }

        const calcularDiasDescuento = (fecha_emision, fecha_vencimiento, fecha_descuento) => {
            const emisionDate = new Date(fecha_emision);
            const vencimientoDate = new Date(fecha_vencimiento);
            const descuentoDate = new Date(fecha_descuento);

            const diffVencimientoEmision = Math.abs(vencimientoDate - emisionDate);
            const diffEmisionDescuento = Math.abs(descuentoDate - emisionDate);

            const diasVencimientoEmision = Math.ceil(diffVencimientoEmision / (1000 * 60 * 60 * 24));
            const diasEmisionDescuento = Math.ceil(diffEmisionDescuento / (1000 * 60 * 60 * 24));

            return diasVencimientoEmision - diasEmisionDescuento;
        };

        console.log("monto nominal", monto_nominal);
        const dias_descuentados = calcularDiasDescuento(fecha_emision, fecha_vencimiento, fecha_descuento);
        console.log("Días Descontados:", dias_descuentados);

        const tasa_interes = bancoResults[0].tasa_interes;
        const comision = bancoResults[0].comision;

        console.log('Tasa de interés:', tasa_interes);
        console.log('Comisión:', comision);

        const suma = Number(1) + Number(tasa_interes);
        console.log('Suma:', suma);
        const dias = dias_descuentados / 360;
        console.log('Dias:', dias);
        const tasa_efectiva_periodo = (suma**dias) - 1.0;
        console.log('Tasa Efectiva Periodo:', tasa_efectiva_periodo);

        const tasa_descontada = (tasa_efectiva_periodo / (1.0 + tasa_efectiva_periodo));
        console.log('Tasa Descontada:', tasa_descontada);

        const monto_descontado = monto_nominal * tasa_descontada;
        console.log('Monto Descontado:', monto_descontado);

        const valor_neto = monto_nominal - monto_descontado;
        console.log('Valor Neto:', valor_neto);

        const comisionporvalornominal = comision * monto_nominal;
        console.log('Comision por Monto Nominal:', comisionporvalornominal);
        const valor_recibido = valor_neto - comisionporvalornominal;
        console.log('Valor Recibido:', valor_recibido);

        const valor_a_entregar = Number(monto_nominal);
        console.log('Valor a Entregar:', valor_a_entregar);

        const valorentregarentrerecibido= valor_a_entregar / valor_recibido;
        console.log('valorentregarentrerecibido: ', valorentregarentrerecibido);
        const tresesentaentrediasdescuentados= 360/dias_descuentados
        console.log('tresesentaentrediasdescuentados:', tresesentaentrediasdescuentados);
        const pretcea = Math.pow(valorentregarentrerecibido, tresesentaentrediasdescuentados);
        console.log('pretcea:', pretcea);
        const tcea = (pretcea - 1) * 100;
        console.log('TCEA:', tcea);

        // Calcular la condición
        const today = new Date();
        const condicion = new Date(fecha_vencimiento) > today ? 1 : 0;  // 1 = Por Vencer, 0 = Vencido
        console.log('Condición:', condicion);

        // Insertar la nueva factura en la base de datos
        const query = `INSERT INTO Facturas (
            usuario_id, banco_id, emisor, numero_documento, fecha_emision, fecha_vencimiento, 
            fecha_descuento, monto_nominal, condicion, dias_descuentados, monto_descontado, 
            tasa_efectiva_periodo, valor_neto, valor_a_entregar, valor_recibido, tcea
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        connection.query(query, [
            usuario_id, banco_id, emisor, numero_documento, fecha_emision, fecha_vencimiento,
            fecha_descuento, monto_nominal, condicion, dias_descuentados, monto_descontado,
            tasa_efectiva_periodo, valor_neto, valor_a_entregar, valor_recibido, tcea
        ], (err, results) => {
            if (err) {
                console.error('Error al agregar la factura:', err);
                return res.status(500).json({ error: 'Error al agregar la factura' });
            }
            res.status(200).json({ message: 'Factura agregada exitosamente' });
        });
    });
};


