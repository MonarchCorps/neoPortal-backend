const express = require('express')
const router = express.Router()
const fetchParticipantsInExamController = require('../../../controllers/exam/liveExam/fetchParticipantsInExamController')

router.get('/:liveId', fetchParticipantsInExamController.handleFetchParticipants)

module.exports = router