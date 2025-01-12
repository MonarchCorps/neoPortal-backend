const jwt = require('jsonwebtoken');

const checkAuth = (req, res, next) => {
    const token = req.cookies.neoPortal_token;

    if (!token)
        return res.status(401).json({ message: "No token provided" });

    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
        if (err)
            return res.status(401).json({ message: "Token expired" });

        req.user = decoded;
        next()
    });
};

const checkToken = (req, res) =>
    res.status(200).json({ message: "Token is valid" });

module.exports = { checkAuth, checkToken }