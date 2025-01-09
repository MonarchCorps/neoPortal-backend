const express = require('express')
const router = express.Router()
const deleteExamController = require('../controllers/deleteExamController')

router.delete('/:id', deleteExamController.handleDeleteExam)

module.exports = router