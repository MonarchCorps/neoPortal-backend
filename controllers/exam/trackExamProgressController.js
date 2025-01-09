const ExamProgress = require("../../models/ExamProgress");

const handleTrackExamProgress = async (req, res) => {

    const { userId, examMode } = req.params;

    try {

        const progress = await ExamProgress.findOne({ userId, examMode }).sort({ _id: -1 }); //returns the latest document. Note a user will not be able to start another practice exam if one is already in session. So it's safe like this

        if (progress) {
            res.json(progress);
        } else {
            res.status(404).json({ message: 'Progress not found' });
        }

    } catch (error) {
        res.status(500).json({
            message: 'Error fetching progress',
            success: false,
            error: error.message
        });
    }

}

const handleSaveProgress = async (req, res) => {
    const { userId, examId, currentSelectedQuestions, questionId, userAnswer, examMode } = req.body;

    try {

        const progress = await ExamProgress.findOne({ userId, examId, examMode });
        if (!progress)
            return res.status(404).json({ message: 'Progress not found' });

        const selectedQuestions = progress.questions.get(currentSelectedQuestions);
        if (!selectedQuestions)
            return res.status(404).json({ message: 'Subject not found in progress' });

        const question = selectedQuestions.find(q => q.questionId.equals(questionId));
        if (question) {
            question.userAnswer = userAnswer;
        } else {
            return res.status(404).json({ message: 'Question not found' });
        }

        await progress.save();
        res.json({ message: 'Progress saved successfully' });

    } catch (error) {
        res.status(500).json({
            message: "Error saving progress",
            success: false,
            error: error.message
        });
    }
};


module.exports = { handleTrackExamProgress, handleSaveProgress }