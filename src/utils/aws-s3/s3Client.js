// utils/aws-s3/presign.js
const { GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const s3 = require('./s3Config');

/**
 * Generates a pre-signed URL for downloading a file from S3
 * @param {string} key - The key of the object in the S3 bucket
 * @param {number} expiresInSeconds - Time in seconds the URL should be valid (default: 900s = 15 mins)
 * @returns {Promise<string>} - Pre-signed GET URL
 */
async function getPresignedUrl(key, expiresInSeconds = 300) {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    });

    const url = await getSignedUrl(s3, command, { expiresIn: expiresInSeconds });
    console.log(`[S3] Generated pre-signed GET URL: ${url}`);
    return url;
  } catch (err) {
    console.error('[S3] Failed to generate GET pre-signed URL:', err);
    throw err;
  }
}

/**
 * Generates a pre-signed PUT URL for uploading a file to S3
 * @param {string} key - The key (path/filename) to store the file as
 * @param {string} contentType - MIME type of the file (e.g., 'application/zip')
 * @param {number} expiresInSeconds - Time in seconds the URL should be valid (default: 900s = 15 mins)
 * @returns {Promise<string>} - Pre-signed PUT URL
 */
async function getPutPresignedUrl(key, contentType = 'application/octet-stream', expiresInSeconds = 300) {
  try {

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });


    const url = await getSignedUrl(s3, command, { expiresIn: expiresInSeconds });
    console.log(`[S3] Generated pre-signed PUT URL: ${url}`);
    return url;
  } catch (err) {
    console.error('[S3] Failed to generate PUT pre-signed URL:', err);
    throw err;
  }
}

module.exports = {
  getPresignedUrl,
  getPutPresignedUrl,
};
