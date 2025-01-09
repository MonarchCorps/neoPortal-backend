const express = require('express')
const router = express.Router()
const fetchTeachersFromSchoolController = require('../controllers/fetchTeachersFromSchoolController')

router.get(`/:assignedSchoolId`, fetchTeachersFromSchoolController.handleFetchTeachers)

module.exports = router