const Question = require("../../../models/Question")

const handleFetchParticipants = async (req, res) => {

    const { liveId } = req.params

    try {

        const exam = await Question.findOne({ liveId: liveId }).lean().exec()
        if (!exam)
            return res.status(400).json({ message: "Exam not found!" })
        if (exam.takenBy.length === 0)
            return res.status(204).json({ message: "No participants found! Check your exam ID." })

        res.status(200).json(exam.takenBy)

    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Error fetching participants",
            success: false,
            error: error.message
        })
    }

}

module.exports = { handleFetchParticipants }