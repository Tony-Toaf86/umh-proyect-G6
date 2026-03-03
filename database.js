const mysql = require('mysql2');

// Configuración de conexión
const db = mysql.createConnection({
    host: 'localhost',
    user: 'toaf',
    password: 'toaf', // Cambiar por la real
    database: 'bbddg4'
});

// Conectar a MySQL
db.connect((err) => {
    if (err) {
        console.error('Error de conexión:', err);
        return;
    }
    console.log('Conectado exitosamente a MySQL');
});

module.exports = db;
