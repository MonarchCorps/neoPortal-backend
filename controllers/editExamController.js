const Question = require("../models/Question")
const User = require("../models/User")

const handleEditExam = async (req, res) => {

    const { id } = req.params
    const { examID, examType, examYear, subject, state, questionsData, liveStartTime, liveEndTime, liveId } = req.body

    if (!id)
        return res.status(400).json({ message: "User ID is required" })

    const user = await User.findById(id).lean().exec()
    if (!user)
        return res.status(400).json({ message: "User not found" })

    try {

        const updatedExam = await Question.findByIdAndUpdate(
            examID,
            {
                $set: {
                    ...(examType && { examType }),
                    ...(examYear && { examYear }),
                    ...(subject && { subject }),
                    ...(state && { state }),
                    ...(questionsData && { questionsData }),
                    ...(liveStartTime && { liveStartTime }),
                    ...(liveEndTime && { liveEndTime }),
                    ...(liveId && { liveId })
                }
            }
        )

        if (!updatedExam)
            return res.status(404).json({ message: "Exam not found" });

        res.sendStatus(200);

    } catch (error) {
        res.status(500).json({
            message: "Error updating exam",
            success: false,
            error: error.message
        })
    }

}

module.exports = { handleEditExam }