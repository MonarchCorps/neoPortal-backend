const mongoose = require('mongoose')
const { Schema } = mongoose

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ['school', 'teacher', 'student']
    },
    profileImage: {
        url: {
            type: String
        },
        publicId: {
            type: String
        }
    },
    type: String,
    cacNumber: String,
    state: String,
    qualification: String,
    licenseNo: String,
    refreshToken: String,
    createdFromSchool: {
        type: Boolean, default: false
    },
    assignedSubject: String,
    assignedSchoolId: String
}, {
    timestamps: true
})

module.exports = mongoose.model('User', userSchema)