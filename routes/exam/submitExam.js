const express = require('express')
const router = express.Router()
const submitExamController = require('../../controllers/exam/submitExamController')

router.post('/', submitExamController.handleSubmitExam)

module.exports = router