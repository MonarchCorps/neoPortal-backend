const Question = require("../models/Question")

const handleFetchUploadedExams = async (req, res) => {
    const { id } = req.params
    if (!id)
        return res.status(400).json({ message: "ID field is required" })

    try {
        const exams = await Question.find({ userId: id }).lean().exec()
        if (!exams)
            return res.status(204).json({ message: "No questions found" })

        res.status(200).json(exams)

    } catch (error) {
        res.status(500).json({
            message: "Error fetching exams",
            success: false,
            error: error.message
        })
    }

}

module.exports = { handleFetchUploadedExams }