const express = require('express')
const router = express.Router()
const trackExamProgressController = require('../../controllers/exam/trackExamProgressController')

router.post('/save', trackExamProgressController.handleSaveProgress)
router.get('/get/:userId/:examMode', trackExamProgressController.handleTrackExamProgress)

module.exports = router