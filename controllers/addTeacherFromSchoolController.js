const { handleSendWelcomeEmail } = require("../config/mail/emails")
const User = require("../models/User")
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const handleAddTeacherFromSchool = async (req, res) => {

    const { name, email, assignedSubject, assignedSchoolId } = req.body

    try {

        const duplicateUser = await User.findOne({ name: name }).lean().exec()
        const duplicateEmail = await User.findOne({ email: email }).lean().exec()

        if (duplicateUser)
            return res.status(400).json({ message: "Name is already in use" })

        if (duplicateEmail)
            return res.status(400).json({ message: "Email is already registered" })

        const hashedPassword = await bcrypt.hash(name.toLowerCase().trim(), 10)

        const newUser = await User.create({
            name: name,
            email: email,
            role: 'teacher',
            password: hashedPassword,
            assignedSubject,
            assignedSchoolId,
            createdFromSchool: true
        })

        const accessToken = jwt.sign(
            {
                UserInfo: {
                    name: newUser.name,
                    role: newUser.role
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '15m' }
        )

        const refreshToken = jwt.sign(
            {
                name: newUser.name
            },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '7d' }
        )

        newUser.refreshToken = refreshToken
        await newUser.save();

        await handleSendWelcomeEmail(newUser.email, newUser.name)

        res.status(200).json({ message: "Created Successfully" })

    } catch (error) {
        res.status(500).json({
            message: "Error adding teacher",
            success: false,
            error: error.message
        })
    }

}

module.exports = { handleAddTeacherFromSchool }