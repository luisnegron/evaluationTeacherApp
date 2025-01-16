const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Role = require('../models/role');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ mensaje: 'Acceso denegado. Token de autorización no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, 'secreto');
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Error al verificar el token:', error);
    res.status(401).json({ mensaje: 'Token de autorización inválido' });
  }
};

/*const checkRole = (permissions) => {
  return (req, res, next) => {
    const userRole = req.user?.role; // Asegúrate de que req.user esté definido y tenga la propiedad 'role'
    console.log('Usuario:', req.user); // Agrega un log para verificar los datos del usuario
    console.log('Rol requerido:', permissions);
    console.log('Rol del usuario:', userRole);

    if (!userRole || !permissions.includes(userRole)) {
      return res.status(403).json({ mensaje: 'Acceso denegado. No tienes permiso para acceder a esta ruta' });
    }

    next();
  };
};*/

const checkRole = (requiredRoles) => {
  return async (req, res, next) => {
      const user = await User.findById(req.user.userId).populate('role');
      if (!user || !requiredRoles.includes(user.role.name)) {
          return res.status(403).json({ message: 'No tienes permiso para acceder a esta ruta' });
      }
      next();
  };
};

module.exports = { 
  verifyToken, 
  checkRole 
};