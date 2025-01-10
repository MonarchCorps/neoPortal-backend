const express = require('express')
const router = express.Router()
const saveQuestionController = require('../../controllers/saved/saveQuestionController')

router.post('/', saveQuestionController.handleSaveQuestion)

module.exports = router