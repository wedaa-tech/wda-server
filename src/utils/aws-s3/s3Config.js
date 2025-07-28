// utils/aws-s3/s3Config.js
const { S3Client } = require('@aws-sdk/client-s3');
const { fromEnv } = require('@aws-sdk/credential-provider-env');

const endpoint = process.env.S3_ENDPOINT;
const region = process.env.S3_REGION; // Hetzner supports any region string, usually 'us-east-1'
const credentials = {
    accessKeyId: process.env.S3_AWS_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  };


const s3 = new S3Client({
  region: region,
  endpoint: endpoint,
  credentials: credentials,
});

module.exports = s3;
