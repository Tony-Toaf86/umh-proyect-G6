const express = require('express');
const proyectosroutes = require('../controllers/controller.proyectos');

const router = express.Router();

router.get('/', proyectosroutes.listar);
router.get('/:id', proyectosroutes.obtenerPorId);
router.post('/', proyectosroutes.insertar);
router.put('/:id', proyectosroutes.actualizar);
router.delete('/:id', proyectosroutes.eliminar);

module.exports = router;
