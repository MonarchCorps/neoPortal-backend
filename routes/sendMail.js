const express = require('express')
const router = express.Router()
const sendMailController = require('../controllers/sendMailController')

router.post('/', sendMailController.handleSendMail)

module.exports = router