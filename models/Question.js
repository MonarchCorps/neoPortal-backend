const mongoose = require('mongoose')
const { Schema } = mongoose

const questionSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    questionsData: [{
        question: {
            type: String,
            required: true
        },
        qOpt: [
            {
                id: {
                    type: String, required: true
                },
                text: {
                    type: String, required: true
                },
            }
        ],
        answer: {
            text: {
                type: String,
                required: true
            },
            desc: {
                type: String
            }
        },
        qType: {
            type: String,
            required: true
        }
    }],
    examType: String,
    examYear: String,
    subject: String,
    state: String,
    mode: {
        type: String,
        enum: ['practice', 'live'],
        required: true
    },
    liveId: String,
    liveStartTime: Date,
    liveEndTime: Date,
    takenBy: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            email: String,
            name: String,
            takenAt: { type: Date, default: Date.now },
            score: { type: Number, default: 0 }
        }
    ],
    liveUserAnswer: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            name: String,
            email: String,
            answers: [
                {
                    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question.questionsData' },
                    selectedOptionId: { type: String }
                }
            ],
            liveSubmitted: { type: Boolean, default: false },
        }
    ]
}, {
    timestamps: true
})

module.exports = mongoose.model('Question', questionSchema)