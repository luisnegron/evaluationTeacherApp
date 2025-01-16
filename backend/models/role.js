// model/role.js
const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    permissions: {
        type: [String], // Lista de permisos específicos del rol
        default: []
    },
    isActive: {
        type: Boolean,
        default: true // Por defecto, los usuarios están activos
    }
}, { timestamps: true });

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;