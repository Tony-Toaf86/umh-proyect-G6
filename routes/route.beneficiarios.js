const express = require('express');
const  Beneficiarios  = require('../controllers/controller.beneficiarios');

const router = express.Router();

router.get('/', Beneficiarios.listar);
router.get('/:id', Beneficiarios.obtenerPorId);
router.post('/', Beneficiarios.insertar);
router.put('/:id', Beneficiarios.actualizar);
router.delete('/:id', Beneficiarios.eliminar);

module.exports = router;
