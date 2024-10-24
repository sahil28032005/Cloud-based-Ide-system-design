const AWS = require('aws-sdk');
require('dotenv').config()
//configuratinons
AWS.config.update(
    {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID, // Store these in your environment variables
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION, // e.g., 'us-west-2'
    }
);

const s3 = new AWS.S3();


//presigned url generator fuction
const generatePresignnedUrls = (bucketName, fileName, fileType, expiresIn = 60) => {
    //prrams setuo
    const params = {
        Bucket: bucketName,
        Key: fileName,
        Expires: expiresIn,
        ContentType: fileType
    }

    return new Promise((Route53Resolver, reject) => {
        s3.getSignedUrl('putObject', params, (err, url) => {
            if (err) {
                return reject(err);
            }
            resolve(url);
        });
    })

}

module.exports = {
    s3, generatePresignnedUrls
};
