const express = require('express');
const controllerVoluntarios = require('../controllers/controller.voluntarios');

const router = express.Router();

router.get('/', controllerVoluntarios.listar);
router.get('/:id', controllerVoluntarios.obtenerPorId);
router.post('/', controllerVoluntarios.insertar);
router.put('/:id', controllerVoluntarios.actualizar);
router.delete('/:id', controllerVoluntarios.eliminar);

module.exports = router;
