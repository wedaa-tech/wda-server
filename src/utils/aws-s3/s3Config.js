// utils/aws-s3/s3Config.js
const { S3Client } = require('@aws-sdk/client-s3');
const { fromEnv } = require('@aws-sdk/credential-provider-env');

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: fromEnv(), // automatically uses AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
});

module.exports = s3;
