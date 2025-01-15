const { transporterData } = require("../config/transporter");

const handleBookAppointment = async (req, res) => {

    const { firstName, lastName, email, content } = req.body

    if (!firstName || !lastName || !email || !content)
        return res.status(400).json({ message: "All fields are required" })

    try {

        const transporter = transporterData();

        await transporter.sendMail({
            from: `${firstName} ${lastName} <${email}>`,
            to: `${process.env.EMAIL_USER}`,
            subject: 'Book appointment',
            text: content
        })

        console.log(`Mail sent from ${email}`);

        res.status(200).json({ message: "Sent" })

    } catch (error) {
        res.status(500).json({
            message: "Error booking appointment",
            success: false,
            error: error.message
        })
    }

}

module.exports = { handleBookAppointment }