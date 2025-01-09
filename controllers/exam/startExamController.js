const ExamProgress = require('../../models/ExamProgress')
const Question = require('../../models/Question')
const User = require('../../models/User')

const handleStartExam = async (req, res) => {
    const { id } = req.params;
    const { examType, details, examId, duration, examMode } = req.body;

    if (!id) {
        return res.status(400).json({ message: "User ID is required" });
    }

    try {

        const user = await User.findById(id).lean().exec();
        if (!user)
            return res.status(404).json({ message: "User not found" });

        const durationRegex = /(\d+)\s*hr.*?(\d+)\s*min/;
        const match = duration.match(durationRegex);
        const hours = match ? parseInt(match[1], 10) : 0;
        const mins = match ? parseInt(match[2], 10) : 0;
        const totalDurationInMs = (hours * 60 + mins) * 60 * 1000;

        const groupedQuestions = {};

        for (const detail of details) {
            const { subjectName, noOfQuestions } = detail;

            const matchCondition = {
                subject: subjectName,
                mode: 'practice'
            };

            if (examType !== 'all') {
                matchCondition.examType = examType;
            }

            const questions = await Question.aggregate([
                { $match: matchCondition },
                { $unwind: "$questionsData" },
                { $sample: { size: noOfQuestions } },
                {
                    $project: {
                        _id: "$questionsData._id",
                        questionText: "$questionsData.question",
                        options: "$questionsData.qOpt",
                        answer: "$questionsData.answer",
                    },
                },
            ]);

            groupedQuestions[subjectName] = questions.map((q) => ({
                questionId: q._id,
                question: q.questionText,
                options: q.options.map((opt) => ({
                    id: opt.id,
                    text: opt.text,
                    _id: opt._id,
                })),
                userAnswer: null,
            }));
        }

        const startTime = new Date();
        const endTime = new Date(startTime.getTime() + totalDurationInMs);

        const existingExam = await ExamProgress.findOne({ userId: id, isCompleted: false, examMode: 'practice' })

        let responseData = {}

        if (existingExam) {
            responseData = {
                userId: existingExam.userId,
                examId: existingExam.examId,
                examType: existingExam.examType,
                questions: existingExam.questions,
                startTime: existingExam.startTime,
                endTime: existingExam.endTime,
                isCompleted: existingExam.isCompleted,
                msg: "An exam is already in session",
                examMode: existingExam.examMode,
                createdAt: existingExam.createdAt
            }
        } else {
            const newProgress = await ExamProgress.create({
                userId: id,
                examId,
                examType,
                questions: groupedQuestions,
                startTime,
                endTime,
                isCompleted: false,
                examMode,
            })

            responseData = newProgress
        }

        res.json(responseData);

    } catch (error) {
        res.status(500).json({
            message: "Error starting exam",
            success: false,
            error: error.message,
        })
    }
}

module.exports = { handleStartExam };
