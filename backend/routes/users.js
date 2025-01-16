// routes/users.js
var express = require('express');
var router = express.Router();
const userController = require('../controllers/userController');
const upload = require('../middlewares/upload'); // Importamos Multer
const authMiddleware = require('../middlewares/auth.middleware');

// Ruta para registrar un nuevo usuario (con imagen)
router.post('/register', authMiddleware.verifyToken, authMiddleware.checkRole(['administrator']), upload.single('photo'), userController.registerUser);

// Ruta para iniciar sesión
router.post('/login', userController.login);

//ruta para obtener todos los usuarios
router.get('/', /*authMiddleware.verifyToken, authMiddleware.checkRole(['administrator']),*/ userController.getUsers);

//ruta para obtener un usuario por id
router.get('/:id', /*authMiddleware.verifyToken, authMiddleware.checkRole(['administrator']),*/ userController.getUserById);

//ruta para actualizar un usuario
router.put('/:id', /*authMiddleware.verifyToken, authMiddleware.checkRole(['administrator']),*/ userController.updateUser);

//ruta para eliminar un usuario
router.delete('/:id', /*authMiddleware.verifyToken, authMiddleware.checkRole(['administrator']),*/ userController.deleteUser);

//ruta para desactivar un usuario
router.patch('/deactivate/:id', /*authMiddleware.verifyToken, authMiddleware.checkRole(['administrator']),*/ userController.deactivateUser);

//ruta para activar un usuario
router.patch('/activate/:id', /*authMiddleware.verifyToken, authMiddleware.checkRole(['administrator']),*/ userController.activateUser);

//ruta para buscar usuarios con diferentes criterios
router.get('/search', /*authMiddleware.verifyToken, authMiddleware.checkRole(['administrator']),*/ userController.searchUsers);

module.exports = router;
