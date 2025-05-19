const AWS = require('aws-sdk');
require('dotenv').config();

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

const uploadToS3 = async (fileBuffer, fileName, mimeType) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `quiz-images/${Date.now()}-${fileName}`,
    Body: fileBuffer,                  // ✅ dùng buffer trực tiếp
    ContentType: mimeType || 'image/png',
    ACL: 'public-read',
  };

  try {
    const data = await s3.upload(params).promise();
    return data.Location; // ✅ trả về URL ảnh
  } catch (err) {
    console.error('S3 Upload Error:', err);
    throw err;
  }
};

module.exports = uploadToS3;
