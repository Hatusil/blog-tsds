var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
const isAuthenticated = require('../middleware/auth'); // Importar el middleware

// Definir la ruta del archivo JSON
const filePath = path.join(__dirname, '../data/posts.json');

// Ruta para crear una nueva publicación
router.post('/create', isAuthenticated, function(req, res) {
    const newPost = req.body;

    // Validar que los datos existan y no estén vacíos
    if (!newPost || Object.keys(newPost).length === 0) {
        return res.status(400).send('El cuerpo de la solicitud está vacío o no es válido');
    }

    // Validar que los datos tengan los campos necesarios
    if (!newPost.id || !newPost.title || !newPost.content) {
        return res.status(400).send('Faltan campos requeridos (id, title, content)');
    }

// Validar que el ID sea un número
if (!newPost.id || isNaN(newPost.id)) {
    return res.status(400).send('El ID debe ser un número válido');
}

// Validar que el título tenga una longitud mínima
if (!newPost.title || newPost.title.length < 5) {
    return res.status(400).send('El título debe tener al menos 5 caracteres');
}

// Validar que el contenido no esté vacío
if (!newPost.content || newPost.content.trim() === '') {
    return res.status(400).send('El contenido no puede estar vacío');
}

    // Leer la base de datos JSON
    fs.readFile(filePath, (err, data) => {
        if (err) {
            return res.status(500).send(`Error al leer la base de datos: ${err.message}`);
        }

        let posts;
        try {
            posts = JSON.parse(data);
        } catch (error) {
            posts = []; // Inicializamos como un array vacío
        }

        // Validar que no haya otro post con el mismo ID
        const postExists = posts.find(post => post.id === newPost.id);
        if (postExists) {
            return res.status(400).send('Ya existe una publicación con ese ID');
        }

        // Agregar la nueva publicación
        posts.push(newPost);

        // Guardar de nuevo en la base de datos JSON
        fs.writeFile(filePath, JSON.stringify(posts, null, 2), (err) => {
            if (err) {
                return res.status(500).send(`Error al guardar la nueva publicación: ${err.message}`);
            }
            res.status(201).send('Publicación creada correctamente');
        });
    });
});


    // Ruta para editar una publicación existente
    router.put('/edit/:id', isAuthenticated, function(req, res) {
        const postId = req.params.id;
        const updatedPost = req.body;
    
        if (!updatedPost || Object.keys(updatedPost).length === 0) {
            return res.status(400).send('No hay datos para actualizar');
        }
    
        fs.readFile(filePath, (err, data) => {
            if (err) {
                return res.status(500).send(`Error al leer la base de datos: ${err.message}`);
            }

            let posts;
            try {
                posts = JSON.parse(data);
            } catch (error) {
                posts = []; // Inicializamos como un array vacío
            }
    
            const postIndex = posts.findIndex(post => post.id == postId);
    
            if (postIndex !== -1) {
                posts[postIndex] = { ...posts[postIndex], ...updatedPost };
    
                fs.writeFile(path.join(__dirname, '../data/posts.json'), JSON.stringify(posts, null, 2), (err) => {
                    if (err) return res.status(500).send('Error al guardar la publicación actualizada');
                    res.status(200).send('Publicación actualizada correctamente');
                });
            } else {
                res.status(404).send('Publicación no encontrada');
            }
        });
    });
    

    // Ruta para eliminar una publicación
    router.delete('/delete/:id', isAuthenticated, function(req, res) {
        const postId = req.params.id;
    
        // Leer la base de datos JSON
        fs.readFile(filePath, (err, data) => {
            if (err) {
                return res.status(500).send(`Error al leer la base de datos: ${err.message}`);
            }
    
            let posts;
            try {
                // Intentar parsear el archivo JSON
                posts = JSON.parse(data);
            } catch (error) {
                posts = [];  // Si el archivo está vacío o corrupto, inicializamos como un array vacío
            }
    
            // Buscar la publicación por su ID
            const initialLength = posts.length;
            posts = posts.filter(post => post.id != postId);
    
            // Si la longitud del array no cambia, significa que la publicación no fue encontrada
            if (initialLength === posts.length) {
                return res.status(404).send('Publicación no encontrada');
            }
    
            // Si la publicación fue eliminada, actualizar el archivo JSON
            fs.writeFile(filePath, JSON.stringify(posts, null, 2), (err) => {
                if (err) {
                    return res.status(500).send(`Error al eliminar la publicación: ${err.message}`);
                }
                res.status(200).send('Publicación eliminada correctamente');
            });
        });
    });
    

module.exports = router;
