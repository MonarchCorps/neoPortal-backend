const express = require('express')
const router = express.Router()
const uploadExamController = require('../controllers/uploadExamController')

router.post('/:id', uploadExamController.handleUploadExam)

module.exports = router