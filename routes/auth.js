const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();

const users = []; // Esto debería ser una base de datos en producción

// Ruta de registro
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    // Validaciones
    if (!username || !password) {
        return res.status(400).send('El nombre de usuario y la contraseña son obligatorios');
    }

    // Comprobar si el usuario ya existe
    const existingUser = users.find(user => user.username === username);
    if (existingUser) {
        return res.status(400).send('El nombre de usuario ya está en uso');
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username, password: hashedPassword });

    res.status(201).send('Usuario registrado con éxito');
});

// Ruta de inicio de sesión
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Validaciones
    if (!username || !password) {
        return res.status(400).send('El nombre de usuario y la contraseña son obligatorios');
    }

    // Buscar al usuario
    const user = users.find(user => user.username === username);
    if (!user) {
        return res.status(400).send('Credenciales inválidas');
    }

    // Comparar contraseñas
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).send('Credenciales inválidas');
    }

    // Generar un token
    const token = jwt.sign({ username }, 'tu_clave_secreta', { expiresIn: '1h' });
    res.json({ token });
});

module.exports = router;