const User = require("../../models/User")
const ExamProgress = require("../../models/ExamProgress")

const handleGetSingleSummary = async (req, res) => {

    const { id, summaryId } = req.params

    if (!id)
        return res.status(400).json({ message: "User Id is required" })

    try {

        const user = await User.findById(id).lean().exec()
        if (!user)
            return res.status(404).json({ message: "User not found" })

        const summary = await
            ExamProgress
                .find({ userId: id, _id: summaryId })
                .sort({ createdAt: -1 })
                .lean()
                .exec()

        if (!summary || summary.length === 0)
            return res.status(204).json({ message: "No exam summary found" })

        res.status(200).json(summary)

    } catch (error) {
        res.status(500).json({
            message: "Error fetching exam summary",
            success: false,
            error: error.message
        })
    }
}

module.exports = { handleGetSingleSummary }