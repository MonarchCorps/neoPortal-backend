const express = require('express')
const router = express.Router()
const startExamController = require('../../controllers/exam/startExamController')

router.post('/:id', startExamController.handleStartExam)

module.exports = router