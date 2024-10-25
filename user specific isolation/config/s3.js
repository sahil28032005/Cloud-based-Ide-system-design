const { S3Client, GetObjectCommand,PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
require('dotenv').config()



const s3 = new  S3Client({
    region: process.env.AWS_REGION, // e.g., 'us-east-1'
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

// Function to generate a presigned URL
const generatePresignedUrl = async (bucketName, fileName, fileType, expiresIn = 60) => {
    // Setup the command
    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        ContentType: fileType,
    });

    // Generate and return the presigned URL
    return await getSignedUrl(s3, command, { expiresIn });
};

module.exports = {
    s3,
    generatePresignedUrl,
};
