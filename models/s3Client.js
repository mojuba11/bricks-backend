const { S3Client } = require("@aws-sdk/client-s3");

/**
 * Universal S3-Compatible Cloud Storage Client
 * * This client initializes using generic environment variables.
 * It allows you to swap cloud storage providers (e.g., AWS S3, Huawei OBS, DigitalOcean Spaces)
 * simply by altering your deployment configuration (.env) without changing application code.
 */

const s3Client = new S3Client({
  // The base region-specific API gateway URL provided by your storage cloud
  endpoint: process.env.CLOUD_STORAGE_ENDPOINT, 

  // The geographic region identifier of your storage data center
  region: process.env.CLOUD_STORAGE_REGION,     

  // Secure identity keys required to authenticate your backend server
  credentials: {
    accessKeyId: process.env.CLOUD_STORAGE_ACCESS_KEY,
    secretAccessKey: process.env.CLOUD_STORAGE_SECRET_KEY,
  },

  // forcePathStyle balances addressing formats between modern virtual hosting styles 
  // (bucket.domain.com) and legacy path styles (domain.com/bucket).
  // Leave false for global standards like AWS/Huawei; change to true if specific private clouds require it.
  forcePathStyle: false, 
});

module.exports = s3Client;
