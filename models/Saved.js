const mongoose = require('mongoose')
const { Schema } = mongoose

const savedSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    questionId: {
        type: String,
    }
})

module.exports = mongoose.model('Saved', savedSchema)