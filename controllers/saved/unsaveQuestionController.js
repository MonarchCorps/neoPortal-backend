const Saved = require("../../models/Saved")

const handleUnsaveQuestion = async (req, res) => {

    const { qId, userId } = req.body
    if (!qId || !userId)
        return res.status(400).json({ message: "All fields are required" })

    try {

        await Saved.findOneAndDelete({ questionId: qId, userId: userId })
        res.sendStatus(204)

    } catch (error) {
        res.status(500).json({
            message: "Error unsaving question",
            success: false,
            error: error.message
        })
    }

}

module.exports = { handleUnsaveQuestion }