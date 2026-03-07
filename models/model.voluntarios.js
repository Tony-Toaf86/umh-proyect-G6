const db = require('../database');

const Voluntarios = {
    crear: (nombre_completo, correo, telefono, callback) => {
        const sql = 'INSERT INTO voluntarios (nombre_completo, correo, telefono) VALUES (?, ?, ?)';
        db.query(sql, [nombre_completo, correo, telefono], callback);
    },

    listar: (callback) => {
        const sql = `
            SELECT id, nombre_completo, correo, telefono
            FROM voluntarios
            ORDER BY id DESC
        `;
        db.query(sql, callback);
    },

    obtenerPorId: (id, callback) => {
        const sql = 'SELECT id, nombre_completo, correo, telefono FROM voluntarios WHERE id = ?';
        db.query(sql, [id], callback);
    },

    actualizar: (id, nombre_completo, correo, telefono, callback) => {
        const sql = 'UPDATE voluntarios SET nombre_completo = ?, correo = ?, telefono = ? WHERE id = ?';
        db.query(sql, [nombre_completo, correo, telefono, id], callback);
    },

    eliminar: (id, callback) => {
        const sql = 'DELETE FROM voluntarios WHERE id = ?';
        db.query(sql, [id], callback);
    }
};

module.exports = Voluntarios;