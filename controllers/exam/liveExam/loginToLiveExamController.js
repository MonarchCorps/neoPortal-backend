const Question = require('../../../models/Question')

const handleLoginToLiveExam = async (req, res) => {
    const { liveId, userId, name, email } = req.body;

    try {
        const exam = await Question.findOne({ liveId, mode: 'live' });

        if (!exam)
            return res.status(404).json({ message: "Exam not found" });

        const currentTime = new Date();
        const startTime = new Date(exam.liveStartTime);
        const endTime = new Date(exam.liveEndTime);

        const adjustedStartTime = new Date(startTime.getTime() + 10 * 60 * 1000);

        if (exam.state === 'saved')
            return res.status(400).json({ message: "Exam is private" })

        if (currentTime < startTime)
            return res.status(400).json({ message: "Exam hasn't started yet." });

        if (currentTime > adjustedStartTime && currentTime < endTime)
            return res.status(400).json({ message: "Exam has already started, login is not allowed." });

        // Check if the current time is after the exam end time
        if (currentTime > endTime)
            return res.status(400).json({ message: "Exam has ended." });

        const alreadyTaken = exam.takenBy.some((entry) => entry.email === email);
        if (alreadyTaken)
            return res.status(400).json({ message: "Exam already taken." });


        const user = { userId, name, email, takenAt: currentTime };
        exam.takenBy.push(user);

        const existingAnswerRecord = exam.liveUserAnswer.find(
            (entry) => entry.email === email
        );

        if (!existingAnswerRecord) {
            exam.liveUserAnswer.push({
                userId: userId,
                name: name,
                email: email,
                answers: []
            });
        }

        if (currentTime >= startTime && currentTime <= adjustedStartTime) {
            res.status(200).json(exam);
        }

        await exam.save();

    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            message: "Error logging in to exam",
            success: false,
            error: error.message
        });
    }
};

module.exports = { handleLoginToLiveExam }