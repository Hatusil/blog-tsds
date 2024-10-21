const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const users = []; // Base de datos en producción


// Ruta GET para mostrar el formulario de registro
router.get('/register', (req, res) => {
    res.render('register');  // Renderiza la vista register.pug
});

// Ruta de registro
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    console.log(req.body);
    
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


// Ruta GET para mostrar el formulario de inicio de sesión
router.get('/login', (req, res) => {
    res.render('login');  // Renderiza la vista login.pug
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