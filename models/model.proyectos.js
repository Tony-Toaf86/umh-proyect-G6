const db = require('../database');

const Proyectos = {
    crear: (nombre, descripcion, fecha_inicio, organizacion_id, callback) => {
        const sql = 'INSERT INTO proyectos (nombre, descripcion, fecha_inicio, organizacion_id) VALUES (?, ?, ?, ?)';
        db.query(sql, [nombre, descripcion, fecha_inicio, organizacion_id], callback);
    },

    listar: (callback) => {
        const sql = `
            SELECT id, nombre, descripcion, fecha_inicio, organizacion_id
            FROM proyectos
            ORDER BY id DESC
        `;
        db.query(sql, callback);
    },

    obtenerPorId: (id, callback) => {
        const sql = 'SELECT id, nombre, descripcion, fecha_inicio, organizacion_id FROM proyectos WHERE id = ?';
        db.query(sql, [id], callback);
    },

    actualizar: (id, nombre, descripcion, fecha_inicio, organizacion_id, callback) => {
        const sql = 'UPDATE proyectos SET nombre = ?, descripcion = ?, fecha_inicio = ?, organizacion_id = ? WHERE id = ?';
        db.query(sql, [nombre, descripcion, fecha_inicio, organizacion_id, id], callback);
    },

    eliminar: (id, callback) => {
        const sql = 'DELETE FROM proyectos WHERE id = ?';
        db.query(sql, [id], callback);
    }
};

module.exports = Proyectos;