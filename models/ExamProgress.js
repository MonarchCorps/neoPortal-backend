const mongoose = require('mongoose');
const { Schema } = mongoose;

const examProgressSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    examId: {
        type: String,
        required: true,
    },
    examType: {
        type: String,
        required: true,
    },
    questions: {
        type: Map,
        of: [
            {
                questionId: mongoose.Schema.Types.ObjectId,
                question: String,
                options: [
                    {
                        id: { type: String, required: true },
                        text: { type: String, required: true },
                    },
                ],
                userAnswer: String,
                correctAnswer: String
            },
        ],
        required: true,
    },
    startTime: {
        type: Date,
        required: true,
    },
    endTime: {
        type: Date,
        required: true,
    },
    isCompleted: {
        type: Boolean,
        default: false,
    },
    totalPercentage: {
        type: String,
        default: null,
    },
    totalCorrect: {
        type: String,
        default: null,
    },
    totalQuestions: {
        type: String,
        default: null,
    },
    subjectBreakdown: {
        type: Map,
        of: {
            correct: { type: Number, default: 0 },
            total: { type: Number, default: 0 },
            percentage: { type: Schema.Types.Mixed, default: "N/A" },
            answered: { type: Number, default: 0 },
            unanswered: { type: Number, default: 0 }
        },
        default: {},
    },
    examMode: {
        type: String,
        enum: ['practice', 'live'],
        required: true
    }
}, {
    timestamps: true
});

examProgressSchema.index({ isCompleted: 1, endTime: 1 });

module.exports = mongoose.model('ExamProgress', examProgressSchema);