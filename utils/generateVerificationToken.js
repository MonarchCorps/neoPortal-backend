const generateVerificationToken = () => {
    return Math.floor(1000000 + Math.random() * 9000000).toString()
}

module.exports = { generateVerificationToken }