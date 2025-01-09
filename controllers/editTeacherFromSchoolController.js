const User = require('../models/User')

const handleEditTeacherFromSchool = async (req, res) => {

    const { teacherId, name, email, assignedSubject } = req.body

    try {

        const updatedUser = await User.findByIdAndUpdate(
            teacherId,
            {
                $set: {
                    ...(name && { name }),
                    ...(email && { email }),
                    ...(assignedSubject && { assignedSubject }),
                }
            },
            { new: true }
        )

        if (!updatedUser)
            return res.status(404).json({ message: "Teacher not found" })

        res.sendStatus(200)

    } catch (error) {
        res.status(500).json({
            message: "Error updating teacher",
            success: false,
            error: error.message
        })
    }
}

module.exports = { handleEditTeacherFromSchool }