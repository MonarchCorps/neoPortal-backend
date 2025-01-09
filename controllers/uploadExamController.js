const Question = require("../models/Question");
const User = require("../models/User");

const handleUploadExam = async (req, res) => {

    const { id } = req.params
    const { examType, examYear, subject, state, questionsData, mode, liveId, liveStartTime, liveEndTime } = req.body

    if ((mode === 'practice' && (!examType || !examYear || !subject || !state)) || !questionsData)
        return res.status(400).json({ message: "All fields are required" })

    if (!id)
        return res.status(400).json({ message: "ID field is required" });

    const user = await User.findById(id).lean().exec()

    if (!user)
        return res.status(404).json({ message: "User not found" })

    try {
        const newQuestions = await Question.create({
            userId: id,
            questionsData,
            examType,
            examYear,
            subject,
            state,
            mode,
            liveId,
            liveStartTime,
            liveEndTime
        })

        res.status(200).json(newQuestions)

    } catch (error) {
        res.status(500).json({
            message: "Error uploading questions",
            success: false,
            error: error.message
        })
    }

}

module.exports = { handleUploadExam }