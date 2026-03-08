const Actividades = require('../models/model.actividades');

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

const normalizarFechaHora = (valor) => {
    const texto = limpiarTexto(valor);
    if (!texto) {
        return null;
    }

    const normalizado = texto.includes('T') ? texto.replace('T', ' ') : texto;
    const conSegundos = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(normalizado)
        ? `${normalizado}:00`
        : normalizado;

    const fecha = new Date(conSegundos.replace(' ', 'T'));
    if (Number.isNaN(fecha.getTime())) {
        return undefined;
    }

    return conSegundos;
};

const manejarErrorBD = (res, err) => {
    if (err && err.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({ error: 'El proyecto seleccionado no existe' });
    }

    return res.status(500).json({ error: err.message || 'Error de base de datos' });
};

exports.insertar = (req, res) => {
    const titulo = limpiarTexto(req.body.titulo);
    const descripcion = limpiarTexto(req.body.descripcion);
    const proyecto_id = parsearId(req.body.proyecto_id);
    const fecha_hora = normalizarFechaHora(req.body.fecha_hora);

    if (!titulo) {
        return res.status(400).json({ error: 'El titulo es obligatorio' });
    }

    if (proyecto_id === null) {
        return res.status(400).json({ error: 'El ID del proyecto es obligatorio y debe ser valido' });
    }

    if (fecha_hora === undefined) {
        return res.status(400).json({ error: 'La fecha y hora es invalida' });
    }

    Actividades.crear(proyecto_id, titulo, descripcion, fecha_hora, (err, result) => {
        if (err) {
            return manejarErrorBD(res, err);
        }

        return res.status(201).json({
            mensaje: 'Actividad insertada correctamente',
            id: result.insertId
        });
    });
};

exports.listar = (req, res) => {
    Actividades.listar((err, result) => {
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

    Actividades.obtenerPorId(id, (err, result) => {
        if (err) {
            return manejarErrorBD(res, err);
        }

        if (!result.length) {
            return res.status(404).json({ error: 'Actividad no encontrada' });
        }

        return res.json(result[0]);
    });
};

exports.actualizar = (req, res) => {
    const id = parsearId(req.params.id);
    const titulo = limpiarTexto(req.body.titulo);
    const descripcion = limpiarTexto(req.body.descripcion);
    const proyecto_id = parsearId(req.body.proyecto_id);
    const fecha_hora = normalizarFechaHora(req.body.fecha_hora);

    if (!id) {
        return res.status(400).json({ error: 'ID invalido' });
    }

    if (!titulo) {
        return res.status(400).json({ error: 'El titulo es obligatorio' });
    }

    if (proyecto_id === null) {
        return res.status(400).json({ error: 'El ID del proyecto es obligatorio y debe ser valido' });
    }

    if (fecha_hora === undefined) {
        return res.status(400).json({ error: 'La fecha y hora es invalida' });
    }

    Actividades.actualizar(id, titulo, descripcion, proyecto_id, fecha_hora, (err, result) => {
        if (err) {
            return manejarErrorBD(res, err);
        }

        if (!result.affectedRows) {
            return res.status(404).json({ error: 'Actividad no encontrada' });
        }

        return res.json({ mensaje: 'Actividad actualizada correctamente' });
    });
};

exports.eliminar = (req, res) => {
    const id = parsearId(req.params.id);

    if (!id) {
        return res.status(400).json({ error: 'ID invalido' });
    }

    Actividades.eliminar(id, (err, result) => {
        if (err) {
            return manejarErrorBD(res, err);
        }

        if (!result.affectedRows) {
            return res.status(404).json({ error: 'Actividad no encontrada' });
        }

        return res.json({ mensaje: 'Actividad eliminada correctamente' });
    });
};




