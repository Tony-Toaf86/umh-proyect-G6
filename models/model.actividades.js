const db = require('../database');

const Actividades = {
    crear: (proyecto_id, titulo, descripcion, fecha_hora, callback) => {
        const sql = 'INSERT INTO actividades (proyecto_id, titulo, descripcion, fecha_hora) VALUES (?, ?, ?, ?)';
        db.query(sql, [proyecto_id, titulo, descripcion, fecha_hora], callback);
    },

    listar: (callback) => {
        const sql = `
            SELECT id, titulo, descripcion, proyecto_id, fecha_hora
            FROM actividades
            ORDER BY id DESC
        `;
        db.query(sql, callback);
    },

    obtenerPorId: (id, callback) => {
        const sql = 'SELECT id, titulo, descripcion, proyecto_id, fecha_hora FROM actividades WHERE id = ?';
        db.query(sql, [id], callback);
    },

    actualizar: (id, titulo, descripcion, proyecto_id, fecha_hora, callback) => {
        const sql = 'UPDATE actividades SET titulo = ?, descripcion = ?, proyecto_id = ?, fecha_hora = ? WHERE id = ?';
        db.query(sql, [titulo, descripcion, proyecto_id, fecha_hora, id], callback);
    },

    eliminar: (id, callback) => {
        const sql = 'DELETE FROM actividades WHERE id = ?';
        db.query(sql, [id], callback);
    }
};

module.exports = Actividades;