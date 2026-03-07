const express = require('express');
const controllerOrganizaciones = require('../controllers/controller.organizaciones');

const router = express.Router();

router.get('/', controllerOrganizaciones.listar);
router.get('/:id', controllerOrganizaciones.obtenerPorId);
router.post('/', controllerOrganizaciones.insertar);
router.put('/:id', controllerOrganizaciones.actualizar);
router.delete('/:id', controllerOrganizaciones.eliminar);

module.exports = router;
