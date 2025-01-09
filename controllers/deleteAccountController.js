const Question = require("../models/Question")
const User = require("../models/User")

const handleDeleteAccount = async (req, res) => {

    const { id } = req.params

    if (!id)
        return res.status(400).json({ message: "ID field is required" })

    const user = await User.findById(id).lean().exec()

    if (!user)
        return res.status(404).json({ message: "User not found" })

    try {

        await User.findByIdAndDelete(id)
        await Question.deleteMany({ userId: id })

        res.sendStatus(204)

    } catch (error) {
        res.status(500).json({
            message: "Error deleting account",
            success: false,
            error: error.message
        })
    }
}

module.exports = { handleDeleteAccount }