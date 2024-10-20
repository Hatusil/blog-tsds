const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const app = express();

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const postsRouter = require('./routes/posts');
const commentsRouter = require('./routes/comments');

const authRoutes = require('./routes/auth');

app.use('/', indexRouter);  // Para la página de inicio
app.use('/posts', postsRouter);  // Para las publicaciones
app.use('/comments', commentsRouter);  // Para los comentarios
app.use('/auth', authRoutes);  // Para autenticación
app.use('/users', usersRouter);  // Para usuarios
app.use(express.static(path.join(__dirname, 'public')));


// Listar todas las rutas registradas
app._router.stack.forEach(function(r) {
  if (r.route && r.route.path) {
    console.log('Ruta activa:', r.route.path);
  } else if (r.name === 'router' && r.handle.stack) {
    r.handle.stack.forEach(function(handler) {
      if (handler.route && handler.route.path) {
        console.log('Ruta activa (router):', handler.route.path);
      }
    });
  }
});

// Configuración del motor de vistas
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Manejo de errores 404
app.use(function(req, res, next) {
  next(createError(404));
});

// Manejo de errores
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
