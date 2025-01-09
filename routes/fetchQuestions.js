const express = require('express')
const router = express.Router()
const fetchAllQuestionsController = require('../controllers/fetchAllQuestionsController')

router.get('/:subject', fetchAllQuestionsController.handleFetchQuestions)

module.exports = router