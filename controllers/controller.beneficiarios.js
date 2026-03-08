const Beneficiarios = require('../models/model.beneficiarios');

const limpiarTexto = (valor) => {
    if (valor === undefined || valor === null) {
        return null;
    }

    const limpio = String(valor).trim();
    return limpio.length ? limpio : null;
};

const parsearId = (valor) => {
    const numero = Number(valor);
    return Number.isInteger(numero) && numero > 0 ? numero : null;
};

const parsearEdad = (valor) => {
    const numero = Number(valor);
    return Number.isInteger(numero) && numero >= 0 ? numero : null;
};

const manejarErrorBD = (res, err) => {
    if (err && err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'El beneficiario ya existe para otro proyecto' });
    }

    return res.status(500).json({ error: err.message || 'Error de base de datos' });
};

exports.insertar = (req, res) => {
    const nombre_completo = limpiarTexto(req.body.nombre_completo);
    const edad = parsearEdad(req.body.edad);
    const proyecto_id = parsearId(req.body.proyecto_id);

    if (!nombre_completo) {
        return res.status(400).json({ error: 'El nombre completo es obligatorio' });
    }

    if (edad === null) {
        return res.status(400).json({ error: 'La edad es obligatoria y debe ser un numero valido' });
    }

    if (proyecto_id === null) {
        return res.status(400).json({ error: 'El ID del proyecto es obligatorio y debe ser valido' });
    }

    Beneficiarios.crear(nombre_completo, edad, proyecto_id, (err, result) => {
        if (err) {
            return manejarErrorBD(res, err);
        }

        return res.status(201).json({
            mensaje: 'Beneficiario insertado correctamente',
            id: result.insertId
        });
    });
};

exports.listar = (req, res) => {
    Beneficiarios.listar((err, result) => {
        if (err) {
            return manejarErrorBD(res, err);
        }

        return res.json(result);
    });
};

exports.obtenerPorId = (req, res) => {
    const id = parsearId(req.params.id);

    if (!id) {
        return res.status(400).json({ error: 'ID invalido' });
    }

    Beneficiarios.obtenerPorId(id, (err, result) => {
        if (err) {
            return manejarErrorBD(res, err);
        }

        if (!result.length) {
            return res.status(404).json({ error: 'Beneficiario no encontrado' });
        }

        return res.json(result[0]);
    });
};

exports.actualizar = (req, res) => {
    const id = parsearId(req.params.id);
    const nombre_completo = limpiarTexto(req.body.nombre_completo);
    const edad = parsearEdad(req.body.edad);
    const proyecto_id = parsearId(req.body.proyecto_id);

    if (!id) {
        return res.status(400).json({ error: 'ID invalido' });
    }

    if (!nombre_completo) {
        return res.status(400).json({ error: 'El nombre completo es obligatorio' });
    }

    if (edad === null) {
        return res.status(400).json({ error: 'La edad es obligatoria y debe ser un numero valido' });
    }

    if (proyecto_id === null) {
        return res.status(400).json({ error: 'El ID del proyecto es obligatorio y debe ser valido' });
    }

    Beneficiarios.actualizar(id, nombre_completo, edad, proyecto_id, (err, result) => {
        if (err) {
            return manejarErrorBD(res, err);
        }

        if (!result.affectedRows) {
            return res.status(404).json({ error: 'Beneficiario no encontrado' });
        }

        return res.json({ mensaje: 'Beneficiario actualizado correctamente' });
    });
};

exports.eliminar = (req, res) => {
    const id = parsearId(req.params.id);

    if (!id) {
        return res.status(400).json({ error: 'ID invalido' });
    }

    Beneficiarios.eliminar(id, (err, result) => {
        if (err) {
            return manejarErrorBD(res, err);
        }

        if (!result.affectedRows) {
            return res.status(404).json({ error: 'Beneficiario no encontrado' });
        }

        return res.json({ mensaje: 'Beneficiario eliminado correctamente' });
    });
};




