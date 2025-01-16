// controllers/userController.js
const User = require('../models/user');
const Role = require('../models/role');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Configuración de JWT
const JWT_SECRET = process.env.JWT_SECRET

// Función para registrar un nuevo usuario
const registerUser = async (req, res) => {
    const { fullName, idCard, email, password, role: roleName, phone, address, birthdate } = req.body;
    console.log(req.body);
    // Verificar si el correo ya existe
    const userExists = await User.findOne({ email }).populate('role', 'name');
    if (userExists) {
        return res.status(400).json({ message: "El correo electrónico ya está registrado" });
    }

    // Verificar si el rol existe
    const role = await Role.findOne({ name: roleName }); // Buscar el rol por nombre
    console.log(role);
    if (!role) {
        return res.status(400).json({ message: "El rol especificado no existe" });
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    try {
        // Obtener la URL de la foto subida (si existe)
        let photoUrl = null;
        if (req.file) {
            photoUrl = path.join('http://localhost:3000/uploads', req.file.filename); // Guardamos la ruta relativa
        }

        // Crear un nuevo usuario
        const user = new User({
            fullName,
            idCard,
            email,
            password: hashedPassword,
            role: role._id,
            phone,
            address,
            birthdate: new Date(birthdate),
            photo: photoUrl,
        });

        // Guardar el usuario en la base de datos
        await user.save();

        // Generar un token JWT
        const token = jwt.sign({ userId: user._id, role: user.role.name }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Responder con éxito
        res.status(201).json({ message: 'Usuario registrado correctamente' });
    } catch (error) {
        console.error('Error al registrar el usuario:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Validar campos vacíos
        if (!email || !password) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios' });
        }

        // Validar formato del correo
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Formato de correo inválido' });
        }

        // Verificar si el correo está registrado
        const user = await User.findOne({ email }).populate('role', 'name');
        if (!user) {
            return res.status(404).json({ message: 'Correo electrónico no registrado' });
        }

        // Verificar si el usuario está inactivo
        if (!user.isActive) {
            return res.status(403).json({ message: 'El usuario está inactivo, contacte al administrador' });
        }

        // Verificar si el usuario está bloqueado temporalmente
        if (user.lockUntil && user.lockUntil > Date.now()) {
            return res.status(403).json({
                message: `Demasiados intentos fallidos, por favor intente de nuevo después de ${Math.ceil((user.lockUntil - Date.now()) / 60000)
                    } minutos`
            });
        }

        // Verificar contraseña
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {

            // Incrementar intentos fallidos
            user.failedAttempts += 1;

            // Bloquear al usuario si excede el límite
            if (user.failedAttempts >= 3) {
                user.lockUntil = new Date(Date.now() + 10 * 60000); // Bloqueo por 10 minutos
            } else {
                
            }

            await user.save();
            return res.status(403).json({ message: 'Contraseña incorrecta' });
            //return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        // Reiniciar intentos fallidos si el login es exitoso
        user.failedAttempts = 0;
        user.lockUntil = null;
        await user.save();

        // Generar token de autenticación
        const token = jwt.sign(
            { userId: user._id, role: user.role.name },
            process.env.JWT_SECRET,
            { expiresIn: '30m' } // Token expira en 30 minutos
        );

        // Responder con el token y redirección según el rol
        res.status(200).json({
            message: 'Autenticación exitosa',
            token,
            role: user.role.name,
        });
    } catch (error) {
        console.error('Error en autenticación:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

//obtener todos los usuarios
const getUsers = async (req, res) => {
    const { page = 1, limit = 10 } = req.query; // Obtener parámetros de consulta para paginación
    try {
        const pageNumber = parseInt(page); // Convertir el valor de la página a entero
        const limitNumber = parseInt(limit); // Convertir el valor del límite a entero

        const users = await User.find()
            .populate('role') // Población del campo 'role' para obtener los datos relacionados
            .limit(limitNumber) // Limitar la cantidad de resultados
            .skip((pageNumber - 1) * limitNumber) // Saltar resultados según la página
            .exec();

        const totalUsers = await User.countDocuments(); // Contar el total de usuarios

        res.status(200).json({
            users,
            totalPages: Math.ceil(totalUsers / limitNumber) || 1, // Calcular el total de páginas
            currentPage: pageNumber
        });
    } catch (error) {
        console.error('Error al obtener los usuarios:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

//obtener un usuario
const getUserById = async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findById(id).populate('role');
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error en obtener usuario:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

//actualizar un usuario
const updateUser = async (req, res) => {
    try {
        const { fullName, idCard, email, password, role: roleName, phone, address, birthdate, photoUrl } = req.body;
        const userId = req.params.id;

        // Buscar el usuario por ID
        const user = await User.findById(userId).populate('role');
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Verificar si el correo ya está registrado por otro usuario
        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) {
                return res.status(400).json({ message: 'El correo electrónico ya está registrado' });
            }
        }

        // Verificar si el rol existe (si se pasa un rol)
        if (roleName) {
            const role = await Role.findOne({ name: roleName });
            if (!role) {
                return res.status(400).json({ message: 'El rol especificado no existe' });
            }
        }

        // Si se proporciona una nueva contraseña, encriptarla
        let hashedPassword = user.password;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 12);
        }

        // Si se proporciona una nueva foto, actualizar la URL de la foto
        let newPhotoUrl = user.photo;
        if (req.file) {
            newPhotoUrl = path.join('http://localhost:3000/uploads', req.file.filename);
        }

        // Actualizar los campos del usuario
        user.fullName = fullName || user.fullName;
        user.idCard = idCard || user.idCard;
        user.email = email || user.email;
        user.password = hashedPassword;
        user.role = roleName ? (await Role.findOne({ name: roleName }))._id : user.role;
        user.phone = phone || user.phone;
        user.address = address || user.address;
        user.birthdate = birthdate ? new Date(birthdate) : user.birthdate;
        user.photo = newPhotoUrl;

        // Guardar los cambios en la base de datos
        await user.save();

        // Responder con el usuario actualizado
        res.status(200).json({ message: 'Usuario actualizado correctamente', user });
    } catch (error) {
        console.error('Error al actualizar el usuario:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

//eliminar un usuario
const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        res.status(200).json({ message: 'Usuario eliminado exitosamente.' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el usuario.', error: error.message });
    }
};

// Desactivar un usuario por ID
const deactivateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        res.status(200).json({ message: 'Usuario desactivado exitosamente.', user });
    } catch (error) {
        res.status(500).json({ message: 'Error al desactivar el usuario.', error: error.message });
    }
};

//Activar un usuario por ID
const activateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isActive: true },
            { new: true }
        );
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        res.status(200).json({ message: 'Usuario activado exitosamente.', user });
    } catch (error) {
        res.status(500).json({ message: 'Error al activar el usuario.', error: error.message });
    }
};


// Buscar usuarios por criterios
const searchUsers = async (req, res) => {
    try {
        const { fullName, email, idCard, phone, role } = req.query;

        const query = {};

        if (fullName) query.fullName = new RegExp(fullName, 'i'); // Búsqueda por nombre (case-insensitive)
        if (email) query.email = new RegExp(email, 'i'); // Búsqueda por correo (case-insensitive)
        if (idCard) query.idCard = new RegExp(idCard, 'i'); // Búsqueda por cédula (case-insensitive)
        if (phone) query.phone = new RegExp(phone, 'i'); // Búsqueda por teléfono (case-insensitive)
        if (role) query.role = role; // Búsqueda por rol

        const users = await User.find(query).populate('role');

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error al buscar usuarios.', error: error.message });
    }
};

module.exports = {
    registerUser,
    login,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    deactivateUser,
    activateUser,
    searchUsers
}