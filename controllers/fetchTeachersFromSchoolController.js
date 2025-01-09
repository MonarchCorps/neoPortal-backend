const User = require("../models/User")

const handleFetchTeachers = async (req, res) => {

    const { assignedSchoolId } = req.params

    try {
        const teachers = await User.find({ assignedSchoolId }).lean().exec()

        if (!teachers || teachers.length === 0)
            return res.status(204).json({ message: "No teachers were found!" })

        res.status(200).json(teachers)

    } catch (error) {
        res.status(500).json({
            message: "Error fetching teachers",
            success: false,
            error: error.message
        })
    }

}

module.exports = { handleFetchTeachers }