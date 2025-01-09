const express = require('express')
const router = express.Router()
const deleteAccountController = require('../controllers/deleteAccountController')

router.delete('/:id', deleteAccountController.handleDeleteAccount)

module.exports = router