// utils/aws-s3/filter.js
const { getPutPresignedUrl } = require('./s3Client');

/**
 * Generates a timestamped S3 key for blueprint image
 * @param {string} userId - User ID
 * @param {string} blueprintId - Blueprint ID
 * @returns {string} - S3 object key (e.g., 'blueprints/userId/blueprintId/04-09-2025-140512.png')
 */
function generateBlueprintImageKey(userId, blueprintId) {
  const currentDate = new Date();

  const formattedDate = currentDate
    .toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    })
    .replace(/\//g, '-');

  const formattedTime = currentDate
    .toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
    .replace(/[:]/g, '');

  const formattedTimestamp = `${formattedDate}-${formattedTime}`;
  const fileName = `${formattedTimestamp}.png`;

  return `blueprints/${userId}/${blueprintId}/${fileName}`;
}

/**
 * Generates both the S3 image key and a PUT pre-signed URL for uploading the image
 * @param {string} userId - User ID
 * @param {string} blueprintId - Blueprint ID
 * @returns {Promise<{ imageKey: string, preSignedUrl: string }>}
 */
async function generateImageUploadDetails(userId, blueprintId) {
  const imageKey = generateBlueprintImageKey(userId, blueprintId);
  const contentType = 'image/png'; // TODO: as of now hardcoded, get from front-end

  const preSignedUrl = await getPutPresignedUrl(imageKey, contentType);

  return {
    imageKey,
    preSignedUrl,
  };
}

module.exports = {
  generateBlueprintImageKey,
  generateImageUploadDetails,
};
