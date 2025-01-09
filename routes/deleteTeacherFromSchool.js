const express = require('express')
const router = express.Router()
const deleteTeacherFromSchoolController = require('../controllers/deleteTeacherFromSchoolController')

router.delete('/:id/:assignedSchoolId', deleteTeacherFromSchoolController.handleDeleteTeacherFromSchool)

module.exports = router