const express = require('express')
const router = express.Router()
const partnerMailCOntroller = require('../controllers/partnerMailController')

router.post('/', partnerMailCOntroller.handleSendPartnerMail)

module.exports = router