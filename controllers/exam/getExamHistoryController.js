const ExamProgress = require("../../models/ExamProgress")
const User = require("../../models/User")

const handleGetHistory = async (req, res) => {

    const { id } = req.params
    if (!id)
        return res.status(400).json({ message: "ID field is required" })

    try {

        const user = await User.findById(id).lean().exec()
        if (!user)
            return res.status(404).json({ message: "User not found" })

        const history = await ExamProgress.find({ userId: id }).lean().exec()
        if (!history || history.length == 0)
            return res.status(204).json({ message: "No history found" })

        res.status(200).json(history)

    } catch (error) {
        res.status(500).json({
            message: "Error fetching history",
            success: false,
            error: error.message
        })
    }

}

module.exports = { handleGetHistory }