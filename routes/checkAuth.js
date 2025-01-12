const express = require('express');
const router = express.Router();
const checkAuthController = require('../controllers/checkAuthController')

router.get('/', checkAuthController.checkAuth, checkAuthController.checkToken);

module.exports = router;