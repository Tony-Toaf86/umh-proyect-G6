const Voluntarios = require('../models/model.voluntarios');

const limpiarTexto = (valor) => {
    if (valor === undefined || valor === null) {
        return null;
    }

    const limpio = String(valor).trim();
    return limpio.length ? limpio : null;
};

const manejarErrorBD = (res, err) => {
    if (err && err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'El correo ya existe para otro voluntario' });
    }

    return res.status(500).json({ error: err.message || 'Error de base de datos' });
};

exports.insertar = (req, res) => {
    const nombre_completo = limpiarTexto(req.body.nombre_completo);
    const correo = limpiarTexto(req.body.correo);
    const telefono = limpiarTexto(req.body.telefono);

    if (!nombre_completo) {
        return res.status(400).json({ error: 'El nombre completo es obligatorio' });
    }

    Voluntarios.crear(nombre_completo, correo, telefono, (err, result) => {
        if (err) {
            return manejarErrorBD(res, err);
        }

        return res.status(201).json({
            mensaje: 'Voluntario insertado correctamente',
            id: result.insertId
        });
    });
};

exports.listar = (req, res) => {
    Voluntarios.listar((err, result) => {
        if (err) {
            return manejarErrorBD(res, err);
        }

        return res.json(result);
    });
};

exports.obtenerPorId = (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'ID invalido' });
    }

    Voluntarios.obtenerPorId(id, (err, result) => {
        if (err) {
            return manejarErrorBD(res, err);
        }

        if (!result.length) {
            return res.status(404).json({ error: 'Voluntario no encontrado' });
        }

        return res.json(result[0]);
    });
};

exports.actualizar = (req, res) => {
    const id = Number(req.params.id);
    const nombre_completo = limpiarTexto(req.body.nombre_completo);
    const correo = limpiarTexto(req.body.correo);
    const telefono = limpiarTexto(req.body.telefono);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'ID invalido' });
    }

    if (!nombre_completo) {
        return res.status(400).json({ error: 'El nombre completo es obligatorio' });
    }

    Voluntarios.actualizar(id, nombre_completo, correo, telefono, (err, result) => {
        if (err) {
            return manejarErrorBD(res, err);
        }

        if (!result.affectedRows) {
            return res.status(404).json({ error: 'Voluntario no encontrado' });
        }

        return res.json({ mensaje: 'Voluntario actualizado correctamente' });
    });
};

exports.eliminar = (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'ID invalido' });
    }

    Voluntarios.eliminar(id, (err, result) => {
        if (err) {
            return manejarErrorBD(res, err);
        }

        if (!result.affectedRows) {
            return res.status(404).json({ error: 'Voluntario no encontrado' });
        }

        return res.json({ mensaje: 'Voluntario eliminado correctamente' });
    });
};




