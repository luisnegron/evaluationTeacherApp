// controllers/roleController.js
const Role = require('../models/role');

//crear un rol
const createRole = async (req, res) => {
  try {
    const { name, permissions } = req.body;

    // Verificar si el rol ya existe
    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return res.status(400).json({ message: 'El rol ya existe.' });
    }

    // Crear y guardar el nuevo rol
    const newRole = new Role({ name, permissions });
    await newRole.save();

    res.status(201).json({ message: 'Rol creado exitosamente.', role: newRole });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el rol.', error: error.message });
  }
};

// Obtener todos los roles
const getRoles = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  try {
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    const roles = await Role.find({ isActive: true })
      .limit(limitNumber) // Limitar la cantidad de resultados
      .skip((pageNumber - 1) * limitNumber) // Saltar resultados según la página
      .exec();
      const totalRoles = await Role.countDocuments({ isActive: true });
    res.status(200).json({
        roles,
        totalPages: Math.ceil(totalRoles / limitNumber) || 1,
        currentPage: pageNumber
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los roles', error });
  }
};

// Obtener un rol por id
const getRoleById = async (req, res) => {
  try {
    const roleId = req.params.id;
    const role = await Role.findById(roleId);
    if (!role) {
      res.status(404).json({ message: 'Rol no encontrado' });
    } else {
      res.status(200).json(role);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el rol', error });
  }
};

//Actualizar un rol
const updateRole = async (req, res) => {
  try {
    const { name, permissions } = req.body;
    const roleId = req.params.id;

    // Buscar el rol a actualizar
    const role = await Role.findById(roleId);

    if (!role) {
      return res.status(404).json({ message: 'Rol no encontrado' });
    }

    // Actualizar los campos del rol
    role.name = name || role.name;
    role.permissions = permissions || role.permissions;

    await role.save();

    res.status(200).json({ message: 'Rol actualizado exitosamente', role });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el rol', error: error.message });
  }
};

// Desactivar un rol por ID
const deactivateRole = async (req, res) => {
  try {
    const role = await Role.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!role) {
      return res.status(404).json({ message: 'Rol no encontrado.' });
    }

    res.status(200).json({ message: 'Rol desactivado exitosamente.', role });
  } catch (error) {
    res.status(500).json({ message: 'Error al desactivar el rol.', error: error.message });
  }
};
// Activar un rol por ID
const activateRole = async (req, res) => {
  try {
    const role = await Role.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
      );
    if (!role) {
      return res.status(404).json({ message: 'Rol no encontrado.' });
    }
    res.status(200).json({ message: 'Rol activado exitosamente.', role });
  } catch (error) {
    res.status(500).json({ message: 'Error al activar el rol.', error: error.message });
  }
};

// Buscar roles por criterios
const searchRoles = async (req, res) => {
  try {
    const { name } = req.query;

    const query = {};

    if (name) query.name = new RegExp(name, 'i'); // Búsqueda por nombre (case-insensitive)

    const roles = await Role.find(query);

    res.status(200).json(roles);
  } catch (error) {
    res.status(500).json({ message: 'Error al buscar roles.', error: error.message });
  }
};

// Eliminar un rol por ID
const deleteRole = async (req, res) => {
  try {
    const role = await Role.findByIdAndDelete(req.params.id);

    if (!role) {
      return res.status(404).json({ message: 'Rol no encontrado.' });
    }

    res.status(200).json({ message: 'Rol eliminado exitosamente.' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el rol.', error: error.message });
  }
};

module.exports = {
  createRole,
  getRoles,
  getRoleById,
  updateRole,
  deactivateRole,
  activateRole,
  searchRoles,
  deleteRole
};