const express = require('express')
const router = express.Router()
const editTeacherFromSchoolController = require('../controllers/editTeacherFromSchoolController')

router.post('/', editTeacherFromSchoolController.handleEditTeacherFromSchool)

module.exports = router