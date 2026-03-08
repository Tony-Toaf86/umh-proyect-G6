const express = require('express');
const actividadesRoutes = require('../controllers/controller.actividades');

const router = express.Router();

router.get('/', actividadesRoutes.listar);
router.get('/:id', actividadesRoutes.obtenerPorId);
router.post('/', actividadesRoutes.insertar);
router.put('/:id', actividadesRoutes.actualizar);
router.delete('/:id', actividadesRoutes.eliminar);

module.exports = router;
