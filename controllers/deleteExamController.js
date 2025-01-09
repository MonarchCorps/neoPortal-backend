const Question = require("../models/Question")

const handleDeleteExam = async (req, res) => {

    const { id } = req.params

    if (!id)
        return res.status(400).json({ message: "Exam ID is required" })

    try {

        await Question.findByIdAndDelete(id)

        res.sendStatus(204)

    } catch (error) {
        res.status(500).json({
            message: "Error deleting exam"
        })
    }

}

module.exports = { handleDeleteExam }