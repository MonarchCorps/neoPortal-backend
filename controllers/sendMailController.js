const { transporterData } = require("../config/transporter");

const handleSendMail = async (req, res) => {

    const { name, email, subject, content } = req.body
    if (!name || !email || !content || !subject)
        return res.status(400).json({ message: "All fields are required" })

    try {

        const transporter = transporterData();

        await transporter.sendMail({
            from: `${name} <${email}>`,
            to: `${process.env.EMAIL_USER}`,
            subject: subject,
            text: content
        })

        console.log(`Mail sent from ${email}`);

        res.status(200).json({ message: "Sent" })

    } catch (error) {
        console.error(`Failed to send email:`, error.message);
        res.status(500).json({
            message: "Error sending mail",
            success: false,
            error: error.message
        })
    }

}

module.exports = { handleSendMail }