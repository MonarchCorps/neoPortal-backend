const express = require('express')
const router = express.Router()
const addTeacherFromSchoolController = require('../controllers/addTeacherFromSchoolController')

router.post('/', addTeacherFromSchoolController.handleAddTeacherFromSchool)

module.exports = router