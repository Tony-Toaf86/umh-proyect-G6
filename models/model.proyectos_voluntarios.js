const db = require('../database');

const ProyectosVoluntarios = {
    crear: (proyecto_id, voluntario_id, fecha_asignacion, callback) => {
        const sql = `
            INSERT INTO proyectos_voluntarios (proyecto_id, voluntario_id, fecha_asignacion)
            VALUES (?, ?, COALESCE(?, CURRENT_TIMESTAMP))
        `;

        db.query(sql, [proyecto_id, voluntario_id, fecha_asignacion], callback);
    },

    listar: (callback) => {
        const sql = `
            SELECT
                pv.proyecto_id,
                p.nombre AS proyecto_nombre,
                pv.voluntario_id,
                v.nombre_completo AS voluntario_nombre,
                pv.fecha_asignacion
            FROM proyectos_voluntarios pv
            INNER JOIN proyectos p ON p.id = pv.proyecto_id
            INNER JOIN voluntarios v ON v.id = pv.voluntario_id
            ORDER BY pv.fecha_asignacion DESC, pv.proyecto_id DESC, pv.voluntario_id DESC
        `;

        db.query(sql, callback);
    },

    obtenerPorClave: (proyecto_id, voluntario_id, callback) => {
        const sql = `
            SELECT
                pv.proyecto_id,
                p.nombre AS proyecto_nombre,
                pv.voluntario_id,
                v.nombre_completo AS voluntario_nombre,
                pv.fecha_asignacion
            FROM proyectos_voluntarios pv
            INNER JOIN proyectos p ON p.id = pv.proyecto_id
            INNER JOIN voluntarios v ON v.id = pv.voluntario_id
            WHERE pv.proyecto_id = ? AND pv.voluntario_id = ?
        `;

        db.query(sql, [proyecto_id, voluntario_id], callback);
    },

    actualizar: (
        proyecto_id_original,
        voluntario_id_original,
        proyecto_id,
        voluntario_id,
        fecha_asignacion,
        callback
    ) => {
        const sql = `
            UPDATE proyectos_voluntarios
            SET
                proyecto_id = ?,
                voluntario_id = ?,
                fecha_asignacion = COALESCE(?, fecha_asignacion)
            WHERE proyecto_id = ? AND voluntario_id = ?
        `;

        db.query(
            sql,
            [
                proyecto_id,
                voluntario_id,
                fecha_asignacion,
                proyecto_id_original,
                voluntario_id_original
            ],
            callback
        );
    },

    eliminar: (proyecto_id, voluntario_id, callback) => {
        const sql = 'DELETE FROM proyectos_voluntarios WHERE proyecto_id = ? AND voluntario_id = ?';
        db.query(sql, [proyecto_id, voluntario_id], callback);
    }
};

module.exports = ProyectosVoluntarios;