const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } = require('../config/cloudflareR2');

/**
 * Generic helper to upload any file buffer to Cloudflare R2
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {string} fileName - Original filename
 * @param {string} userId - User's Firebase UID or 'anonymous'
 * @param {string} folder - Destination subfolder (e.g. 'project-pdfs', 'project-videos', 'project-zips')
 * @param {string} contentType - MIME type (e.g. 'application/pdf', 'video/mp4', 'application/zip')
 * @returns {Promise<string>} - Publicly accessible URL of uploaded file
 */
const uploadFileToR2 = async (fileBuffer, fileName, userId, folder, contentType) => {
  try {
    const timestamp = Date.now();
    const sanitizedFileName = (fileName || 'file').replace(/[^a-zA-Z0-9.-]/g, '_');
    const safeUserId = userId || 'anonymous';
    const key = `${folder}/${safeUserId}/${timestamp}-${sanitizedFileName}`;

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
    });

    await r2Client.send(command);

    const publicUrl = `${R2_PUBLIC_URL}/${key}`;
    return publicUrl;
  } catch (error) {
    console.error(`R2 upload error for ${folder}:`, error);
    throw new Error(`Failed to upload ${folder} file to Cloudflare R2: ${error.message}`);
  }
};

/**
 * Upload PDF report to Cloudflare R2
 */
const uploadPdfToR2 = async (fileBuffer, fileName, userId) => {
  return uploadFileToR2(fileBuffer, fileName, userId, 'project-pdfs', 'application/pdf');
};

/**
 * Upload MP4 video demo to Cloudflare R2
 */
const uploadVideoToR2 = async (fileBuffer, fileName, userId) => {
  return uploadFileToR2(fileBuffer, fileName, userId, 'project-videos', 'video/mp4');
};

/**
 * Upload ZIP source code archive to Cloudflare R2
 */
const uploadZipToR2 = async (fileBuffer, fileName, userId) => {
  return uploadFileToR2(fileBuffer, fileName, userId, 'project-zips', 'application/zip');
};

/**
 * Delete a file from Cloudflare R2 given its public URL or key
 */
const deleteFileFromR2 = async (fileUrlOrKey) => {
  if (!fileUrlOrKey) return;
  try {
    let key = fileUrlOrKey;
    if (fileUrlOrKey.startsWith('http://') || fileUrlOrKey.startsWith('https://')) {
      const url = new URL(fileUrlOrKey);
      key = url.pathname.replace(/^\//, '');
    }

    const command = new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });

    await r2Client.send(command);
    console.log(`Deleted file from R2: ${key}`);
  } catch (error) {
    console.error('Failed to delete file from R2:', error.message);
  }
};

/**
 * Generate pre-signed download URL (valid for 1 hour)
 * @param {string} key - File key in R2
 * @returns {Promise<string>} - Pre-signed download URL
 */
const generateDownloadUrl = async (key) => {
  try {
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });

    const signedUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });
    return signedUrl;
  } catch (error) {
    console.error('Generate download URL error:', error);
    throw new Error('Failed to generate download URL');
  }
};

module.exports = {
  uploadFileToR2,
  uploadPdfToR2,
  uploadVideoToR2,
  uploadZipToR2,
  deleteFileFromR2,
  generateDownloadUrl,
};
