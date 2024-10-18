var express = require('express');
var router = express.Router();
var fs = require('fs').promises;
var path = require('path');
const isAuthenticated = require('../middleware/auth');

// Ruta para agregar un comentario a una publicación
router.post('/add/:postId', isAuthenticated, async function(req, res) {
    const postId = req.params.postId;
    const newComment = req.body;

    // Verificar que el comentario tenga los campos necesarios
    if (!newComment || !newComment.user || !newComment.text) {
        return res.status(400).send('Faltan campos en el comentario (user, text)');
    }

    try {
        // Leer el archivo JSON
        const data = await fs.readFile(path.join(__dirname, '../data/posts.json'), 'utf8');
        let posts = JSON.parse(data);

        // Encontrar la publicación por su ID
        const post = posts.find(post => post.id === postId);

        if (post) {
            // Si el array de comentarios no existe, inicializarlo
            if (!post.comments) {
                post.comments = [];
            }

            // Agregar el nuevo comentario
            post.comments.push(newComment);

            // Guardar el cambio en el archivo JSON
            await fs.writeFile(path.join(__dirname, '../data/posts.json'), JSON.stringify(posts, null, 2));
            return res.status(201).send('Comentario agregado correctamente');
        } else {
            return res.status(404).send('Publicación no encontrada');
        }
    } catch (err) {
        console.error(err);
        return res.status(500).send('Error al procesar la solicitud');
    }
});

module.exports = router;