const { VERIFICATION_EMAIL_TEMPLATE, PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE, WELCOME_EMAIL_TEMPLATE } = require('./emailTemplates')
const nodemailer = require('nodemailer')

const transporterData = () => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT, 10),
        secure: process.env.SMTP_SECURE == true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        },
    });
    return transporter
}

const handleSendVerificationEmail = async (userEmail, verificationToken) => {

    try {
        await transporter.sendMail({
            from: `Neo Portal <${process.env.EMAIL_USER}>`,
            to: `${userEmail}`,
            subject: `Verify your email`,
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
        })

        console.log(`Verification email sent to ${userEmail}`);
    } catch (error) {
        console.error(`Failed to send verification email to ${userEmail}:`, error.message);
    }

}

const handleSendWelcomeEmail = async (userEmail, userName) => {
    const transporter = transporterData();

    try {
        await transporter.sendMail({
            from: `Neo Portal <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: `Welcome to Neo Portal`,
            html: WELCOME_EMAIL_TEMPLATE.replace("{userName}", userName),
        });

        console.log(`Welcome email sent to ${userEmail}`);
    } catch (error) {
        console.error(`Failed to send welcome email to ${userEmail}:`, error.message);
    }
};

const handleSendPasswordResetEmail = async (userEmail, resetUrl) => {
    const transporter = transporterData();

    try {
        await transporter.sendMail({
            from: `Neo Portal <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: "Reset your password",
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replace(/{resetURL}/g, resetUrl),
        });

        console.log(`Password reset email sent to ${userEmail}`);
    } catch (error) {
        console.error(`Failed to send password reset email to ${userEmail}:`, error.message);
    }
};


const handleSendResetSuccessEmail = async (userEmail) => {
    const transporter = transporterData();

    try {
        await transporter.sendMail({
            from: `Neo Portal <${process.env.EMAIL_USER}>`,
            to: `${userEmail}`,
            subject: `Password reset successful`,
            html: PASSWORD_RESET_SUCCESS_TEMPLATE
        })

        console.log(`Password reset success email sent to ${userEmail}`);
    } catch (error) {
        console.error(`Failed to send password reset success email to ${userEmail}:`, error.message);
    }

}

module.exports = { handleSendVerificationEmail, handleSendPasswordResetEmail, handleSendResetSuccessEmail, handleSendWelcomeEmail }