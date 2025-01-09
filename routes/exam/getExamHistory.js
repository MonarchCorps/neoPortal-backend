const express = require('express')
const router = express.Router()
const getExamHistoryController = require('../../controllers/exam/getExamHistoryController')

router.get('/:id', getExamHistoryController.handleGetHistory)

module.exports = router