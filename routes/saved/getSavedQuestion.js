const express = require('express')
const router = express.Router()
const getSavedQuestionController = require('../../controllers/saved/getSavedQuestionController')

router.get('/:id', getSavedQuestionController.handleGetSavedQuestion)

module.exports = router