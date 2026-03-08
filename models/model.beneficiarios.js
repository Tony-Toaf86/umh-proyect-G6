const db = require('../database');

const Beneficiarios = {
    crear: (nombre_completo, edad, proyecto_id, callback) => {
        const sql = 'INSERT INTO beneficiarios (nombre_completo, edad, proyecto_id) VALUES (?, ?, ?)';
        db.query(sql, [nombre_completo, edad, proyecto_id], callback);
    },

    listar: (callback) => {
        const sql = `
            SELECT id, nombre_completo, edad, proyecto_id
            FROM beneficiarios
            ORDER BY id DESC
        `;
        db.query(sql, callback);
    },

    obtenerPorId: (id, callback) => {
        const sql = 'SELECT id, nombre_completo, edad, proyecto_id FROM beneficiarios WHERE id = ?';
        db.query(sql, [id], callback);
    },

    actualizar: (id, nombre_completo, edad, proyecto_id, callback) => {
        const sql = 'UPDATE beneficiarios SET nombre_completo = ?, edad = ?, proyecto_id = ? WHERE id = ?';
        db.query(sql, [nombre_completo, edad, proyecto_id, id], callback);
    },

    eliminar: (id, callback) => {
        const sql = 'DELETE FROM beneficiarios WHERE id = ?';
        db.query(sql, [id], callback);
    }
};

module.exports = Beneficiarios;