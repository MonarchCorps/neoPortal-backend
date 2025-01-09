const Question = require("../models/Question")
const User = require("../models/User")

const handleDeleteTeacherFromSchool = async (req, res) => {

    const { id, assignedSchoolId } = req.params

    try {
        const teacher = await User.findOne({ _id: id, assignedSchoolId }).lean().exec()

        if (!teacher)
            return res.status(404).json({ message: "Teacher not found" })

        await User.findByIdAndDelete(id)
        await Question.deleteMany({ userId: id })

        res.sendStatus(204)

    } catch (error) {
        res.status(500).json({
            message: "Error deleting teacher",
            success: false,
            error: error.message
        })
    }
}

module.exports = { handleDeleteTeacherFromSchool }