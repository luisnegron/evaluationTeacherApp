// model/user.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Definir el esquema del Usuario
const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    idCard: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    /*role: {
        type: String,
        enum: ['student', 'teacher', 'administrator'],
        required: true
    },*/
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role', // Referencia al modelo Role
        required: true
    },
    phone: {
        type: String,
        default: ''
    },
    address: {
        type: String,
        default: ''
    },
    birthdate: {
        type: Date,
        required: false
    },
    photo: {
    type: String, // URL de la foto
    default: null
    },
    isActive: {
        type: Boolean,
        default: true // Por defecto, los usuarios están activos
    },
    failedAttempts: { 
        type: Number, 
        default: 0 
    },
    lockUntil: { 
        type: Date, 
        default: null 
    }
}, { timestamps: true });

// Crear el modelo
const User = mongoose.model('User', userSchema);

module.exports = User;