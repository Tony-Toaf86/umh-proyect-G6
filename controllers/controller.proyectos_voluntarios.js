const ProyectosVoluntarios = require('../models/model.proyectos_voluntarios');

const parsearId = (valor) => {
    const id = Number(valor);
    return Number.isInteger(id) && id > 0 ? id : null;
};

const normalizarFechaHora = (valor) => {
    if (valor === undefined || valor === null) {
        return null;
    }

    const texto = String(valor).trim();
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
    if (err && err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'La asignacion ya existe para ese proyecto y voluntario' });
    }

    if (err && err.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({ error: 'El proyecto o voluntario seleccionado no existe' });
    }

    return res.status(500).json({ error: err.message || 'Error de base de datos' });
};

exports.insertar = (req, res) => {
    const proyecto_id = parsearId(req.body.proyecto_id);
    const voluntario_id = parsearId(req.body.voluntario_id);
    const fecha_asignacion = normalizarFechaHora(req.body.fecha_asignacion);

    if (!proyecto_id || !voluntario_id) {
        return res.status(400).json({ error: 'Proyecto y voluntario son obligatorios' });
    }

    if (fecha_asignacion === undefined) {
        return res.status(400).json({ error: 'La fecha de asignacion es invalida' });
    }

    ProyectosVoluntarios.crear(proyecto_id, voluntario_id, fecha_asignacion, (err, result) => {
        if (err) {
            return manejarErrorBD(res, err);
        }

        return res.status(201).json({
            mensaje: 'Asignacion creada correctamente',
            id: {
                proyecto_id,
                voluntario_id
            },
            filasAfectadas: result.affectedRows
        });
    });
};

exports.listar = (req, res) => {
    ProyectosVoluntarios.listar((err, result) => {
        if (err) {
            return manejarErrorBD(res, err);
        }

        return res.json(result);
    });
};

exports.obtenerPorId = (req, res) => {
    const proyecto_id = parsearId(req.params.proyecto_id);
    const voluntario_id = parsearId(req.params.voluntario_id);

    if (!proyecto_id || !voluntario_id) {
        return res.status(400).json({ error: 'IDs invalidos' });
    }

    ProyectosVoluntarios.obtenerPorClave(proyecto_id, voluntario_id, (err, result) => {
        if (err) {
            return manejarErrorBD(res, err);
        }

        if (!result.length) {
            return res.status(404).json({ error: 'Asignacion no encontrada' });
        }

        return res.json(result[0]);
    });
};

exports.actualizar = (req, res) => {
    const proyecto_id_original = parsearId(req.params.proyecto_id);
    const voluntario_id_original = parsearId(req.params.voluntario_id);
    const proyecto_id = req.body.proyecto_id === undefined
        ? proyecto_id_original
        : parsearId(req.body.proyecto_id);
    const voluntario_id = req.body.voluntario_id === undefined
        ? voluntario_id_original
        : parsearId(req.body.voluntario_id);
    const fecha_asignacion = normalizarFechaHora(req.body.fecha_asignacion);

    if (!proyecto_id_original || !voluntario_id_original) {
        return res.status(400).json({ error: 'IDs invalidos' });
    }

    if (!proyecto_id || !voluntario_id) {
        return res.status(400).json({ error: 'Proyecto y voluntario son obligatorios' });
    }

    if (fecha_asignacion === undefined) {
        return res.status(400).json({ error: 'La fecha de asignacion es invalida' });
    }

    ProyectosVoluntarios.actualizar(
        proyecto_id_original,
        voluntario_id_original,
        proyecto_id,
        voluntario_id,
        fecha_asignacion,
        (err, result) => {
            if (err) {
                return manejarErrorBD(res, err);
            }

            if (!result.affectedRows) {
                return res.status(404).json({ error: 'Asignacion no encontrada' });
            }

            return res.json({ mensaje: 'Asignacion actualizada correctamente' });
        }
    );
};

exports.eliminar = (req, res) => {
    const proyecto_id = parsearId(req.params.proyecto_id);
    const voluntario_id = parsearId(req.params.voluntario_id);

    if (!proyecto_id || !voluntario_id) {
        return res.status(400).json({ error: 'IDs invalidos' });
    }

    ProyectosVoluntarios.eliminar(proyecto_id, voluntario_id, (err, result) => {
        if (err) {
            return manejarErrorBD(res, err);
        }

        if (!result.affectedRows) {
            return res.status(404).json({ error: 'Asignacion no encontrada' });
        }

        return res.json({ mensaje: 'Asignacion eliminada correctamente' });
    });
};