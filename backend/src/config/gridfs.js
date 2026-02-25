const { GridFSBucket } = require('mongodb');
const mongoose = require('mongoose');

let templateBucket;

const initGridFS = (db) => {
  templateBucket = new GridFSBucket(db, { bucketName: 'professorTemplates' });
  return templateBucket;
};

const uploadToGridFS = (buffer, filename) => {
  return new Promise((resolve, reject) => {
    if (!templateBucket) {
      return reject(new Error('GridFS bucket not initialized'));
    }
    const uploadStream = templateBucket.openUploadStream(filename);
    uploadStream.id = new mongoose.Types.ObjectId();
    
    uploadStream.on('error', reject);
    uploadStream.on('finish', () => resolve(uploadStream.id)); // ✅ uploadStream.id is ObjectId
    uploadStream.end(buffer);
  });
};

const deleteFromGridFS = async (gridFSIdString) => {
  if (!templateBucket) {
    throw new Error('GridFS bucket not initialized');
  }
  
  const gridFSId = new mongoose.Types.ObjectId(gridFSIdString);
  await templateBucket.delete(gridFSId);
};

const downloadFromGridFS = (gridFSIdString) => {
  if (!templateBucket) throw new Error('GridFS not initialized');
  return templateBucket.openDownloadStreamById(new mongoose.Types.ObjectId(gridFSIdString));
};

module.exports = { initGridFS, uploadToGridFS, deleteFromGridFS, downloadFromGridFS };

