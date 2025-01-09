const express = require('express')
const router = express.Router()
const liveSubmitExamController = require('../../../controllers/exam/liveExam/liveSubmitExamController')

router.post('/', liveSubmitExamController.handleSubmitExam)

module.exports = router