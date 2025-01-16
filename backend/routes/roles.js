// routes/users.js
var express = require('express');
var router = express.Router();
const roleController = require('../controllers/roleController');

// Obtener todos los roles
router.get('/', roleController.getRoles);

// Obtener un rol por id
router.get('/:id', roleController.getRoleById);

// Crear un rol
router.post('/', roleController.createRole);

// Actualizar un rol
router.put('/:id', roleController.updateRole);

// Eliminar un rol
router.delete('/:id', roleController.deleteRole);

//desactivar un rol
router.patch('/deactivate/:id', roleController.deactivateRole);

//activar un rol
router.patch('/activate/:id', roleController.activateRole);

//buscar rol
router.get('/search', roleController.searchRoles);

module.exports = router;