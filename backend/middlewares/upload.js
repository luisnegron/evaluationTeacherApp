// middleware/upload.js
const multer = require('multer');
const path = require('path');

// Configuración de Multer para subir imágenes
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Carpeta donde se guardarán las imágenes
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Renombramos el archivo para evitar conflictos
        const ext = path.extname(file.originalname);
        cb(null, Date.now() + ext); // Nombre único basado en la fecha
    }
});

// Filtrar los archivos para permitir solo imágenes
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const mimeType = allowedTypes.test(file.mimetype);
    const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimeType && extName) {
        return cb(null, true);
    }
    cb(new Error('Invalid file type. Only JPEG, JPG, and PNG are allowed.'));
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB límite de tamaño
    fileFilter: fileFilter
});

module.exports = upload;