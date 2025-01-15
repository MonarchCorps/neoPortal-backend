const { transporterData } = require("../config/transporter");

const handleSendPartnerMail = async (req, res) => {

    const { firstName, lastName, organizationName, email, phoneNumber, content } = req.body

    if (!firstName || !lastName || !organizationName || !email || !phoneNumber || !content)
        return res.status(400).json({ message: "All fields are required" })

    try {

        const transporter = transporterData();

        await transporter.sendMail({
            from: `${firstName} ${lastName} <${email}>`,
            to: `${process.env.EMAIL_USER}`,
            organizationName,
            phoneNumber,
            subject: 'Partner with us',
            text: content
        })

        console.log(`Mail sent from ${email}`);

        res.status(200).json({ message: "Sent" })

    } catch (error) {
        res.status(500).json({
            message: "Error sending mail",
            success: false,
            error: error.message
        }
        )
    }
}

module.exports = { handleSendPartnerMail }