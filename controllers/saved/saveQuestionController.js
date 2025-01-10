const Saved = require("../../models/Saved")

const handleSaveQuestion = async (req, res) => {

    const { userId, questionId } = req.body
    console.log(userId, questionId)
    if (!userId || !questionId)
        return res.status(400).json({ message: "All fields are required" })

    try {

        const newSaved = await Saved.create({
            userId,
            questionId
        })

        res.status(200).json(newSaved)

    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Error saving question",
            success: false,
            error: error.message
        })
    }
}

module.exports = { handleSaveQuestion }