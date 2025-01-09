const express = require('express')
const router = express.Router()
const fetchUploadedExamsController = require('../controllers/fetchUploadedExamsController')

router.get('/:id', fetchUploadedExamsController.handleFetchUploadedExams)

module.exports = router