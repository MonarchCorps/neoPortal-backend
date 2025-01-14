const User = require("../../models/User")
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const { handleSendPasswordResetEmail, handleSendResetSuccessEmail } = require("../../config/mail/emails")

const handleLogin = async (req, res) => {
    const { state, password } = req.body

    if (!state && !password)
        return res.status(400).json({ message: "All fields are required" })

    try {

        const user = await User.findOne({
            $or: [
                { name: state },
                { email: state }
            ]
        })

        if (!user)
            return res.status(400).json({ message: "Incorrect details or password" })

        const match = await bcrypt.compare(password, user.password);

        if (!match)
            return res.status(400).json({ message: "Incorrect details or password" });

        const cookies = req.cookies
        const alreadyRefreshToken = cookies?.neoPortal_token

        if (alreadyRefreshToken) {
            res.clearCookie('neoPortal_token', {
                httpOnly: true,
                sameSite: 'strict',
                secure: process.env.NODE_ENV === 'production'
            });
        }

        const accessToken = jwt.sign(
            {
                UserInfo: {
                    name: user.name,
                    role: user.role
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '15m' }
        )

        const refreshToken = jwt.sign(
            { name: user.name },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '70d' }
        )

        const userResponse = {
            accessToken,
            _id: user._id,
            role: user.role,
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber,
            type: user.type,
            cacNumber: user.cacNumber,
            state: user.state,
            qualification: user.qualification,
            licenseNo: user.licenseNo,
            createdAt: user.createdAt,
            profileImage: user.profileImage,
            assignedSubject: user.assignedSubject
        }

        res.cookie('neoPortal_token', refreshToken, {
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 70 * 24 * 60 * 60 * 1000
        });

        await User.updateOne(
            { _id: user._id },
            {
                $push: { refreshTokens: refreshToken },
                $set: { lastLogin: Date.now() }
            }
        );

        res.status(200).json(userResponse)

    } catch (error) {
        res.status(500).json({
            message: "An error occurred during login",
            success: false,
            error: error.message
        })
    }
}

const handleRefreshToken = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.neoPortal_token)
        return res.sendStatus(401);


    try {
        const refreshToken = cookies.neoPortal_token;

        const user = await User.findOne({ refreshTokens: { $in: [refreshToken] } }).lean().exec();

        if (!user)
            return res.sendStatus(400)

        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)

        if (user.name !== decoded.name)
            return res.sendStatus(403);

        const accessToken = jwt.sign(
            {
                UserInfo: {
                    name: user.name,
                    role: user.role
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '15m' }
        )

        const userResponse = {
            accessToken,
            _id: user._id,
            role: user.role,
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber,
            type: user.type,
            cacNumber: user.cacNumber,
            state: user.state,
            qualification: user.qualification,
            licenseNo: user.licenseNo,
            createdAt: user.createdAt,
            profileImage: user.profileImage,
            assignedSubject: user.assignedSubject
        }

        res.status(200).json(userResponse)
    } catch (error) {
        res.status(500).json({
            message: "Server Error",
            success: false,
            error: error.message
        })
    }

}

const handleLogout = async (req, res) => {
    const cookies = req.cookies;

    if (!cookies?.neoPortal_token)
        return res.sendStatus(204);

    try {
        const refreshToken = cookies?.neoPortal_token;

        const user = await User.findOne({ refreshTokens: { $in: [refreshToken] } });

        if (!user) {
            res.clearCookie('neoPortal_token', {
                httpOnly: true,
                sameSite: 'strict',
                secure: process.env.NODE_ENV === 'production'
            });
            return res.sendStatus(204);
        }

        await User.updateOne(
            { _id: user._id },
            { $pull: { refreshTokens: refreshToken } }
        );

        res.clearCookie('neoPortal_token', {
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production'
        });

        res.sendStatus(204);

    } catch (error) {
        res.status(500).json({
            message: "An error occurred during logout",
            success: false,
            error: error.message
        });
    }
};


const handleForgetPassword = async (req, res) => {

    const { email } = req.body

    if (!email)
        return res.status(400).json({ message: "Email is required" })

    try {

        const user = await User.findOne({ email }).exec()

        if (!user)
            return res.status(404).json({ message: "User not found" })

        const resetToken = crypto.randomBytes(20).toString('hex')
        const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000 // 1hr

        user.resetPasswordToken = resetToken
        user.resetPasswordExpiresAt = resetTokenExpiresAt

        await user.save()

        await handleSendPasswordResetEmail(user.email, `${process.env.FRONTEND_URL}/reset-password/${resetToken}`)

        res.status(200).json({ message: "Reset email sent!" })

    } catch (error) {
        res.status(500).json({
            message: "Error sending reset email",
            success: false,
            error: error.message
        })
    }

}

const handleResetPassword = async (req, res) => {

    const { token } = req.params
    if (!token)
        return res.status(400).json({ message: "Reset token is required" })

    const { password } = req.body
    if (!password)
        return res.status(400).json({ message: "Password is required" })

    try {

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiresAt: { $gt: Date.now() }
        })

        if (!user)
            return res.status(404).json({ message: "User not found" })

        const hashedPassword = await bcrypt.hash(password, 10)

        user.password = hashedPassword
        user.resetPasswordToken = undefined
        user.resetPasswordExpiresAt = undefined
        await user.save()

        await handleSendResetSuccessEmail(user.email)

        res.status(200).json({ message: "Success email sent!" })

    } catch (error) {
        res.status(500).json({
            message: "Error resetting password",
            success: false,
            error: error.message
        })
    }
}

module.exports = { handleLogin, handleRefreshToken, handleLogout, handleForgetPassword, handleResetPassword }