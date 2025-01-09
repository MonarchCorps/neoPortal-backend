const User = require("../models/User");
const cloudinary = require('cloudinary').v2;
const { PassThrough } = require("stream");

const handleEditProfile = async (req, res) => {
    const { id } = req.params;
    const { name, email, phoneNumber, qualification, licenseNo, cacNumber, state, type } = req.body;

    let profileImage;

    cloudinary.config({
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.CLOUD_API_KEY,
        api_secret: process.env.CLOUD_API_SECRET,
        secure: true,
    });

    if (req.file && req.file.size > 10485760) {
        return res.status(400).json({ message: "File size exceeds the 10MB limit" });
    }

    try {

        const duplicateName = await User.findOne({ name, _id: { $ne: id } });
        if (duplicateName)
            return res.status(409).json({ message: "Name is already in use" });

        const duplicateEmail = await User.findOne({ email, _id: { $ne: id } });
        if (duplicateEmail)
            return res.status(409).json({ message: "Email is already in use" });

        if (req.file) {
            const data = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        resource_type: "image",
                        use_filename: false,
                        unique_filename: true,
                        overwrite: false,
                        folder: 'Exam_Portal/user'
                    },
                    (error, result) => {
                        if (result) resolve(result);
                        else reject(error);
                    }
                );

                const bufferStream = new PassThrough();
                bufferStream.end(req.file.buffer);
                bufferStream.pipe(uploadStream);
            });

            profileImage = {
                url: data.secure_url,
                publicId: data.public_id,
            };
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            {
                $set: {
                    ...(name && { name }),
                    ...(email && { email }),
                    ...(phoneNumber && { phoneNumber }),
                    ...(qualification && { qualification }),
                    ...(licenseNo && { licenseNo }),
                    ...(profileImage && { profileImage }),
                    ...(cacNumber && { cacNumber }),
                    ...(state && { state }),
                    ...(type && { type })
                },
            },
            { new: true }
        );

        if (!updatedUser)
            return res.status(404).json({ message: "User not found" });

        res.sendStatus(200);
    } catch (error) {
        res.status(500).json({
            message: "Error updating profile",
            success: false,
            error: error.message,
        })
    }
}

module.exports = { handleEditProfile }