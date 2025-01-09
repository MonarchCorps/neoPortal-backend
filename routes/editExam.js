const express = require('express')
const router = express.Router()
const editExamController = require('../controllers/editExamController')

router.patch('/:id', editExamController.handleEditExam)

module.exports = router