const express = require('express')
const router = express.Router()
const editProfileController = require('../controllers/editProfileController')
const multer = require('multer')

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.patch('/:id', upload.single('profileImage'), editProfileController.handleEditProfile)

module.exports = router