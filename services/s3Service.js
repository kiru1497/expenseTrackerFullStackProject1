const AWS = require("aws-sdk");

// Configure S3
const s3 = new AWS.S3({
  accessKeyId: process.env.IAM_USER_KEY,
  secretAccessKey: process.env.IAM_USER_SECRET,
  region: "ap-south-2",
});

// Upload file to S3
const uploadToS3 = async (data, fileName) => {
  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: fileName,
    Body: data,
    ContentType: "text/csv",
  };

  return new Promise((resolve, reject) => {
    s3.upload(params, (err, result) => {
      if (err) {
        reject(err);
      } else {
        // Generate signed URL after upload
        const signedUrl = s3.getSignedUrl("getObject", {
          Bucket: process.env.BUCKET_NAME,
          Key: fileName,
          Expires: 60 * 5, // 5 minutes
        });

        resolve({
          fileUrl: result.Location, // S3 internal URL (not directly usable)
          signedUrl: signedUrl, // Use this for download
          fileName: fileName,
        });
      }
    });
  });
};

// Generate signed URL separately (for old files / history feature)
const getSignedUrl = (fileName) => {
  return s3.getSignedUrl("getObject", {
    Bucket: process.env.BUCKET_NAME,
    Key: fileName,
    Expires: 60 * 5, // 5 minutes
  });
};

module.exports = {
  uploadToS3,
  getSignedUrl,
};
