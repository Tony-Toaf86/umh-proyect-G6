const Organizaciones = require('../models/model.organizaciones');

const limpiarTexto = (valor) => {
    if (valor === undefined || valor === null) {
        return null;
    }

    const limpio = String(valor).trim();
    return limpio.length ? limpio : null;
};

const manejarErrorBD = (res, err) => {
    if (err && err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'El correo ya existe para otra organización' });
    }

    return res.status(500).json({ error: err.message || 'Error de base de datos' });
};

exports.insertar = (req, res) => {
    const nombre = limpiarTexto(req.body.nombre);
    const contacto = limpiarTexto(req.body.contacto);
    const tipo_convenio = limpiarTexto(req.body.tipo_convenio);

    if (!nombre) {
        return res.status(400).json({ error: 'El nombre es obligatorio' });
    }

    Organizaciones.crear(nombre, contacto, tipo_convenio, (err, result) => {
        if (err) {
            return manejarErrorBD(res, err);
        }

        return res.status(201).json({
            mensaje: 'Organización insertada correctamente',
            id: result.insertId
        });
    });
};

exports.listar = (req, res) => {
    Organizaciones.listar((err, result) => {
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

    Organizaciones.obtenerPorId(id, (err, result) => {
        if (err) {
            return manejarErrorBD(res, err);
        }

        if (!result.length) {
            return res.status(404).json({ error: 'Organización no encontrada' });
        }

        return res.json(result[0]);
    });
};

exports.actualizar = (req, res) => {
    const id = Number(req.params.id);
    const nombre = limpiarTexto(req.body.nombre);
    const contacto = limpiarTexto(req.body.contacto);
    const tipo_convenio = limpiarTexto(req.body.tipo_convenio);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'ID invalido' });
    }

    if (!nombre) {
        return res.status(400).json({ error: 'El nombre es obligatorio' });
    }

    Organizaciones.actualizar(id, nombre, contacto, tipo_convenio, (err, result) => {
        if (err) {
            return manejarErrorBD(res, err);
        }

        if (!result.affectedRows) {
            return res.status(404).json({ error: 'Organización no encontrada' });
        }

        return res.json({ mensaje: 'Organización actualizada correctamente' });
    });
};

exports.eliminar = (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'ID invalido' });
    }

    Organizaciones.eliminar(id, (err, result) => {
        if (err) {
            return manejarErrorBD(res, err);
        }

        if (!result.affectedRows) {
            return res.status(404).json({ error: 'Organización no encontrada' });
        }

        return res.json({ mensaje: 'Organización eliminada correctamente' });
    });
};




