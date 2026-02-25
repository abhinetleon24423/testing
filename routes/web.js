const express = require('express');
const router = express.Router();
const UserController = require('../app/Http/Controllers/UserController');
const PageController = require('../app/Http/Controllers/PageController');
const AuthMiddleware = require('../app/Http/Middleware/AuthMiddleware');

router.get('/', UserController.indexPage);
router.get('/about', PageController.about);
router.get('/contact', PageController.contact);

router.get('/users', UserController.index);
router.get('/users/:id', UserController.show);
router.post('/users', UserController.store);
router.put('/users/:id', UserController.update);
router.delete('/users/:id', AuthMiddleware, UserController.destroy);

module.exports = router;
