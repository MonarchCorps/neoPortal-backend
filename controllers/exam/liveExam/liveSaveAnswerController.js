const Question = require("../../../models/Question");

const handleSaveAnswer = async (req, res) => {

    const { liveId, userId, questionId, selectedOptionId } = req.body;

    try {
        const exam = await Question.findOne({ liveId, mode: 'live' });

        if (!exam)
            return res.status(404).json({ message: "Exam not found" });

        const userAnswer = exam.liveUserAnswer.find((entry) => entry.userId.toString() === userId);

        if (!userAnswer)
            return res.status(404).json({ message: "User not found in live exam answers" });

        const answerIndex = userAnswer.answers.findIndex(
            (answer) => answer.questionId.toString() === questionId
        );

        if (answerIndex !== -1) {
            // Update existing answer
            userAnswer.answers[answerIndex].selectedOptionId = selectedOptionId;
        } else {
            // Add new answer
            userAnswer.answers.push({ questionId, selectedOptionId });
        }

        await exam.save();
        res.status(200).json(exam);

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error saving user answer",
            success: false,
            error: error.message
        });
    }
};


module.exports = { handleSaveAnswer }