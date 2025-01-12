const User = require('../../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { handleSendWelcomeEmail } = require('../../config/mail/emails')

const handleRegister = async (req, res) => {

    const { name, email, phoneNumber, type, cacNumber, state, password, qualification, licenseNo, role } = req.body

    try {
        const duplicateUser = await User.findOne({ name: name }).lean().exec()
        const duplicateEmail = await User.findOne({ email: email }).lean().exec()

        if (duplicateUser)
            return res.status(400).json({ message: "Name is already in use" })

        if (duplicateEmail)
            return res.status(400).json({ message: "Email is already registered" })

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = await User.create({
            name: name,
            email: email,
            role: role,
            password: hashedPassword,
            phoneNumber: phoneNumber,
            type: type,
            cacNumber: cacNumber,
            state: state,
            qualification: qualification,
            licenseNo: licenseNo,
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
            { expiresIn: '70d' }
        )

        newUser.refreshToken = refreshToken;
        await newUser.save();

        res.cookie('neoPortal_token', refreshToken, {
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        await handleSendWelcomeEmail(newUser.email, newUser.name)

        const userResponse = {
            accessToken,
            _id: newUser._id,
            role: newUser.role,
            name: newUser.name,
            email: newUser.email,
            phoneNumber: newUser.phoneNumber,
            type: newUser.type,
            cacNumber: newUser.cacNumber,
            state: newUser.state,
            qualification: newUser.qualification,
            licenseNo: newUser.licenseNo,
            createdAt: newUser.createdAt,
            profileImage: newUser.profileImage
        }

        res.status(201).json(userResponse)

    } catch (error) {
        res.status(500).json({
            message: "Error creating account",
            success: false,
            error: error.message
        })
    }
}

module.exports = { handleRegister }