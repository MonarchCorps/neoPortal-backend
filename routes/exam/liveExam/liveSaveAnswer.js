const express = require('express')
const router = express.Router()
const liveSaveAnswerController = require('../../../controllers/exam/liveExam/liveSaveAnswerController')

router.post('/', liveSaveAnswerController.handleSaveAnswer)

module.exports = router