const Question = require('../../../models/Question');
const User = require('../../../models/User');

const handleSubmitExam = async (req, res) => {
    const { liveId, userId } = req.body;

    try {
        const exam = await Question.findOne({ liveId, mode: 'live' });

        if (!exam)
            return res.status(404).json({ message: "Exam not found" });

        const userAnswers = exam.liveUserAnswer.find((entry) => entry.userId.toString() === userId);

        if (!userAnswers)
            return res.status(404).json({ message: "User answers not found" });

        if (userAnswers.liveSubmitted)
            return res.status(400).json({ message: "Exam already submitted for this user" });

        let score = 0;

        userAnswers.answers.forEach((userAnswer) => {
            const question = exam.questionsData.find(
                (q) => q._id.toString() === userAnswer.questionId.toString()
            );

            if (question && question.qOpt.some(opt => opt.id === userAnswer.selectedOptionId)) {
                const selectedOption = question.qOpt.find(opt => opt.id === userAnswer.selectedOptionId);
                if (selectedOption.id === question.answer.text) {
                    score += 1;
                }
            }
        });

        const userIndex = exam.liveUserAnswer.findIndex(
            (entry) => entry.userId.toString() === userId
        );

        if (userIndex !== -1) {
            exam.liveUserAnswer[userIndex].liveSubmitted = true;
        }

        const takenByIndex = exam.takenBy.findIndex(
            (entry) => entry.userId.toString() === userId
        );
        const userToPush = await User.findById({ _id: userId }).exec();

        if (takenByIndex !== -1) {
            exam.takenBy[takenByIndex].score = score;
        } else {
            exam.takenBy.push({
                name: userToPush.name,
                email: userToPush.email,
                userId,
                score,
            });
        }

        await exam.save();

        res.status(200).json({ message: "Exam submitted successfully", score });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error submitting exam",
            success: false,
            error: error.message
        });
    }
}

const autoSubmitLiveExam = async (exam) => {
    try {
        for (const user of exam.liveUserAnswer) {
            if (user.liveSubmitted) continue;

            let score = 0;

            user.answers.forEach((userAnswer) => {
                const question = exam.questionsData.find(
                    (q) => q._id.toString() === userAnswer.questionId.toString()
                );

                if (question && question.qOpt.some(opt => opt.id === userAnswer.selectedOptionId)) {
                    const selectedOption = question.qOpt.find(opt => opt.id === userAnswer.selectedOptionId);
                    if (selectedOption.id === question.answer.text) {
                        score += 1;
                    }
                }
            });

            user.liveSubmitted = true;

            const userIndex = exam.takenBy.findIndex(
                (entry) => entry.userId.toString() === user.userId.toString()
            );

            if (userIndex !== -1) {
                exam.takenBy[userIndex].score = score;
            } else {
                exam.takenBy.push({ userId: user.userId, name: user.name, email: user.email, score });
            }

            console.log(`Auto submitted for ${user.name}. Score ${score}`)

        }

        await exam.save();
    } catch (error) {
        console.error('Error in auto-submit:', error);
    }
};


module.exports = { handleSubmitExam, autoSubmitLiveExam }