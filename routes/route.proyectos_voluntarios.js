const express = require('express');
const controllerProyectosVoluntarios = require('../controllers/controller.proyectos_voluntarios');

const router = express.Router();

router.get('/', controllerProyectosVoluntarios.listar);
router.get('/:proyecto_id/:voluntario_id', controllerProyectosVoluntarios.obtenerPorId);
router.post('/', controllerProyectosVoluntarios.insertar);
router.put('/:proyecto_id/:voluntario_id', controllerProyectosVoluntarios.actualizar);
router.delete('/:proyecto_id/:voluntario_id', controllerProyectosVoluntarios.eliminar);

module.exports = router;