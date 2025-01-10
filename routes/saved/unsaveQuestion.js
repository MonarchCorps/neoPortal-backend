const express = require('express')
const router = express.Router()
const unsaveQuestionController = require('../../controllers/saved/unsaveQuestionController')

router.post('/', unsaveQuestionController.handleUnsaveQuestion)

module.exports = router