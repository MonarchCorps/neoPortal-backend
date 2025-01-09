const express = require('express')
const router = express.Router()
const loginToLiveExamController = require('../../../controllers/exam/liveExam/loginToLiveExamController')

router.post('/', loginToLiveExamController.handleLoginToLiveExam)

module.exports = router