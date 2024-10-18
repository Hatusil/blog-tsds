const jwt = require('jsonwebtoken');

function isAuthenticated(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1]; // Extraer el token del header

    if (!token) {
        return res.status(401).send('Acceso denegado: se requiere autenticación');
    }

    try {
        const verified = jwt.verify(token, 'tu_clave_secreta');
        req.user = verified; // Almacenar información del usuario en la solicitud
        next();
    } catch (error) {
        return res.status(400).send('Token inválido');
    }
}

module.exports = isAuthenticated;