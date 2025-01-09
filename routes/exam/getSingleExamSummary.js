const express = require('express')
const router = express.Router()
const getSingleExamSummaryController = require('../../controllers/exam/getSingleExamSummaryController')

router.get('/:id/:summaryId', getSingleExamSummaryController.handleGetSingleSummary)

module.exports = router