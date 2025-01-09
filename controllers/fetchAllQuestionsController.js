const Question = require("../models/Question")

const handleFetchQuestions = async (req, res) => {

    const { subject } = req.params
    if (!subject)
        return res.status(400).json({ message: "Subject field is required" })

    try {
        const questions = await
            Question.
                find({ subject, state: 'published', mode: 'practice' })
                .sort({ createdAt: -1 })
                .lean()
                .exec()

        if (!questions || questions.length === 0)
            return res.status(204).json({ message: "No questions found" })

        const flattenedQuestions = questions.flatMap((details) =>
            details.questionsData.map((question) => ({
                ...question,
                examType: details.examType,
                examYear: details.examYear,
                subject: details.subject,
                state: details.state,
                examId: details._id,
            }))
        );

        res.status(200).json(flattenedQuestions)

    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Error fetching questions",
            success: false,
            error: error.message
        }
        )
    }
}

module.exports = { handleFetchQuestions }