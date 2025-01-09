const mongoose = require('mongoose')
const Question = require("../../models/Question")
const ExamProgress = require("../../models/ExamProgress")

async function calculateScore(examProgress) {
    let totalCorrect = 0;
    let totalQuestions = 0;
    let subjectBreakdown = {};

    for (const [subjectName, subjectQuestions] of examProgress.questions.entries()) {
        let subjectCorrect = 0;
        let subjectTotal = 0;
        let subjectAnswered = 0;
        let subjectUnanswered = 0;

        if (subjectQuestions.length === 0) {
            subjectBreakdown[subjectName] = {
                correct: 0,
                total: 0,
                answered: 0,
                unanswered: 0,
                percentage: "N/A"
            };
            continue;
        }

        for (const questionData of subjectQuestions) {
            const { questionId, userAnswer } = questionData;

            subjectTotal++;
            totalQuestions++;

            try {
                const questionRecord = await Question.findOne({ "questionsData._id": questionId, mode: 'practice' }, { "questionsData.$": 1 });

                if (!questionRecord || !questionRecord.questionsData || questionRecord.questionsData.length === 0) {
                    console.error(`Question with ID ${questionId} not found.`);
                    continue;
                }

                const questionDetails = questionRecord.questionsData[0];
                const correctAnswerId = questionDetails.answer.text;

                if (userAnswer === null) {
                    subjectUnanswered++;
                } else if (userAnswer === correctAnswerId) {
                    subjectCorrect++;
                    totalCorrect++;
                    subjectAnswered++;
                } else {
                    subjectAnswered++;
                }
            } catch (error) {
                console.error(`Error fetching question with ID ${questionId}:`, error.message);
                continue;
            }
        }

        const subjectPercentage = subjectTotal > 0
            ? ((subjectCorrect / subjectTotal) * 100).toFixed(2)
            : "N/A";

        subjectBreakdown[subjectName] = {
            correct: subjectCorrect,
            total: subjectTotal,
            answered: subjectAnswered,
            unanswered: subjectUnanswered,
            percentage: subjectPercentage,
        };
    }

    const totalPercentage = totalQuestions > 0
        ? ((totalCorrect / totalQuestions) * 100).toFixed(2)
        : "N/A";

    return { totalPercentage, totalCorrect, totalQuestions, subjectBreakdown };
}


const handleSubmitExam = async (req, res) => {
    const { userId, examProgressId, examMode } = req.body;

    if (!examProgressId)
        return res.status(400).json({ message: "Exam progress ID is required" });

    try {
        const examProgress = await ExamProgress.findOne({ userId, examId: examProgressId, examMode: examMode });
        if (!examProgress)
            return res.status(404).json({ message: "Exam progress not found." });

        if (examProgress.isCompleted)
            return res.status(400).json({ message: "Exam already submitted." });

        const { totalPercentage, totalCorrect, totalQuestions, subjectBreakdown } = await calculateScore(examProgress);

        examProgress.totalPercentage = totalPercentage;
        examProgress.totalCorrect = totalCorrect;
        examProgress.totalQuestions = totalQuestions;
        examProgress.subjectBreakdown = subjectBreakdown;
        examProgress.isCompleted = true;

        await examProgress.save();

        res.json(examProgress);

    } catch (error) {
        console.error("Error submitting exam:", error.message);
        res.status(500).json({
            message: "Error submitting exam",
            success: false,
            error: error.message,
        });
    }
}
const autoSubmitExam = async (exam) => {
    try {
        const { totalPercentage, totalCorrect, totalQuestions, subjectBreakdown } = await calculateScore(exam);

        exam.totalPercentage = totalPercentage;
        exam.totalCorrect = totalCorrect;
        exam.totalQuestions = totalQuestions;
        exam.subjectBreakdown = subjectBreakdown;
        exam.isCompleted = true;

        await exam.save();
        console.log(`Exam ${exam._id} auto-submitted.`);
    } catch (error) {
        console.error(`Failed to auto-submit exam ${exam._id}:`, error);
    }
}

module.exports = { handleSubmitExam, autoSubmitExam };