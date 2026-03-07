const db = require('../database');

const Organizaciones = {
    crear: (nombre, contacto, tipo_convenio, callback) => {
        const sql = 'INSERT INTO organizaciones (nombre, contacto, tipo_convenio) VALUES (?, ?, ?)';
        db.query(sql, [nombre, contacto, tipo_convenio], callback);
    },

    listar: (callback) => {
        const sql = `
            SELECT id, nombre, contacto, tipo_convenio
            FROM organizaciones
            ORDER BY id DESC
        `;
        db.query(sql, callback);
    },

    obtenerPorId: (id, callback) => {
        const sql = 'SELECT id, nombre, contacto, tipo_convenio FROM organizaciones WHERE id = ?';
        db.query(sql, [id], callback);
    },

    actualizar: (id, nombre, contacto, tipo_convenio, callback) => {
        const sql = 'UPDATE organizaciones SET nombre = ?, contacto = ?, tipo_convenio = ? WHERE id = ?';
        db.query(sql, [nombre, contacto, tipo_convenio, id], callback);
    },

    eliminar: (id, callback) => {
        const sql = 'DELETE FROM organizaciones WHERE id = ?';
        db.query(sql, [id], callback);
    }
};

module.exports = Organizaciones;