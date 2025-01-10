const Question = require('../../models/Question');
const Saved = require('../../models/Saved');
const User = require('../../models/User');

const handleGetSavedQuestion = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: "User ID is required" });
    }

    try {
        const user = await User.findById(id).lean().exec();
        if (!user)
            return res.status(404).json({ message: "User not found" });

        const savedQuestions = await Saved.find({ userId: id }).lean().exec();
        if (!savedQuestions.length)
            return res.status(204).json({ message: "No saved questions found", savedQuestions: [] });

        const questionIds = savedQuestions.map(saved => saved.questionId);

        const questions = await Question.find(
            { 'questionsData._id': { $in: questionIds } },
            { 'questionsData.$': 1, subject: 1 }
        ).lean().exec();

        const detailedQuestions = questions.map(qDoc => {
            const questionData = qDoc.questionsData[0];
            return {
                ...questionData,
                subject: qDoc.subject
            }
        })

        res.status(200).json(detailedQuestions)

    } catch (error) {
        res.status(500).json({
            message: "Error fetching saved questions",
            success: false,
            error: error.message
        });
    }
};

module.exports = { handleGetSavedQuestion }