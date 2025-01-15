const express = require('express')
const router = express.Router()
const bookAppointmentController = require('../controllers/bookAppointmentController')

router.post('/', bookAppointmentController.handleBookAppointment)

module.exports = router