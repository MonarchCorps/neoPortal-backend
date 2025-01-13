const User = require("../../models/User")
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

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


module.exports = { handleLogin, handleRefreshToken, handleLogout }