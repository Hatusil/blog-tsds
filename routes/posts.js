const express = require('express');
const router = express.Router();
const fs = require('fs').promises; // Versión con promesas de fs
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const isAuthenticated = require('../middleware/auth');
const filePath = path.join(__dirname, '../data/posts.json');

// Ruta para obtener todas las publicaciones
router.get('/', async (req, res) => {
    try {
        const data = await fs.readFile(path.join(__dirname, '../data/posts.json'), 'utf8');
        const posts = JSON.parse(data);

        res.render('posts', { posts });
    } catch (err) {
        console.error('Error al cargar las publicaciones:', err);
        res.status(500).send('Error al cargar las publicaciones');
    }
});


router.get('/create', (req, res) => {
    res.render('post');  // Esto hay que ver...
});

// Ruta para crear una nueva publicación
router.post('/create', isAuthenticated, async (req, res) => {
    const newPost = req.body;
    const validCategories = ['Materia', 'Cuatrimestre', 'Exámenes'];

    // Validaciones
    if (!newPost || Object.keys(newPost).length === 0) {
        return res.status(400).json({ error: 'El cuerpo de la solicitud está vacío o no es válido' });
    }
    if (!newPost.title || !newPost.content || !newPost.category) {
        return res.status(400).json({ error: 'Faltan campos requeridos (title, content, category)' });
    }
    if (newPost.title.length < 5) {
        return res.status(400).json({ error: 'El título debe tener al menos 5 caracteres' });
    }
    if (newPost.content.trim() === '') {
        return res.status(400).json({ error: 'El contenido no puede estar vacío' });
    }
    if (!validCategories.includes(newPost.category)) {
        return res.status(400).json({ error: 'Categoría no válida' });
    }

    // Generar ID
    newPost.id = uuidv4();

    try {
        // Leer y actualizar el archivo JSON
        const data = await fs.readFile(filePath, 'utf8');
        const posts = JSON.parse(data) || [];

        posts.push(newPost);

        await fs.writeFile(filePath, JSON.stringify(posts, null, 2));

        res.status(201).json({ message: 'Publicación creada correctamente' });
    } catch (err) {
        res.status(500).json({ error: `Error al procesar la solicitud: ${err.message}` });
    }
});

// Ruta para editar una publicación existente
router.put('/edit/:id', isAuthenticated, async (req, res) => {
    const postId = req.params.id;
    const updatedPost = req.body;
    const validCategories = ['Materia', 'Cuatrimestre', 'Exámenes'];

    if (!updatedPost || Object.keys(updatedPost).length === 0) {
        return res.status(400).json({ error: 'No hay datos para actualizar' });
    }
    if (updatedPost.category && !validCategories.includes(updatedPost.category)) {
        return res.status(400).json({ error: 'Categoría no válida' });
    }

    try {
        const data = await fs.readFile(filePath, 'utf8');
        let posts = JSON.parse(data) || [];

        const postIndex = posts.findIndex(post => post.id === postId);
        if (postIndex === -1) {
            return res.status(404).json({ error: 'Publicación no encontrada' });
        }

        posts[postIndex] = { 
            ...posts[postIndex], 
            ...(updatedPost.title && { title: updatedPost.title }),
            ...(updatedPost.content && { content: updatedPost.content }),
            ...(updatedPost.category && { category: updatedPost.category })
        };

        await fs.writeFile(filePath, JSON.stringify(posts, null, 2));

        res.status(200).json({ message: 'Publicación actualizada correctamente' });
    } catch (err) {
        res.status(500).json({ error: `Error al procesar la solicitud: ${err.message}` });
    }
});

// Ruta para eliminar una publicación
router.delete('/delete/:id', isAuthenticated, async (req, res) => {
    const postId = req.params.id;

    try {
        const data = await fs.readFile(filePath, 'utf8');
        let posts = JSON.parse(data) || [];

        const initialLength = posts.length;
        posts = posts.filter(post => post.id !== postId);

        if (initialLength === posts.length) {
            return res.status(404).json({ error: 'Publicación no encontrada' });
        }

        await fs.writeFile(filePath, JSON.stringify(posts, null, 2));

        res.status(200).json({ message: 'Publicación eliminada correctamente' });
    } catch (err) {
        res.status(500).json({ error: `Error al procesar la solicitud: ${err.message}` });
    }
});

// Ruta de filtrado
router.get('/filter', async (req, res) => {
    const category = req.query.category;

    if (!category) {
        return res.status(400).json({ error: 'La categoría es obligatoria' });
    }

    try {
        const data = await fs.readFile(filePath, 'utf8');
        const posts = JSON.parse(data) || [];

        const filteredPosts = posts.filter(post => post.category === category);
        res.status(200).json(filteredPosts);
    } catch (err) {
        res.status(500).json({ error: 'Error al leer la base de datos' });
    }
});

// Ruta de búsqueda
router.get('/search', async (req, res) => {
    const query = req.query.q;

    if (!query) {
        return res.status(400).json({ error: 'La consulta de búsqueda es obligatoria' });
    }

    try {
        const data = await fs.readFile(filePath, 'utf8');
        const posts = JSON.parse(data) || [];

        const searchResults = posts.filter(post =>
            post.title.toLowerCase().includes(query.toLowerCase()) ||
            post.content.toLowerCase().includes(query.toLowerCase()) ||
            post.category.toLowerCase().includes(query.toLowerCase())
        );

        if (searchResults.length === 0) {
            return res.status(404).json({ error: 'No se encontraron resultados para la búsqueda' });
        }

        res.status(200).json(searchResults);
    } catch (err) {
        res.status(500).json({ error: 'Error al leer la base de datos' });
    }
});

module.exports = router;
