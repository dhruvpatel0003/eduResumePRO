const { GridFSBucket } = require('mongodb');
const mongoose = require('mongoose');

let templateBucket;

const initGridFS = (db) => {
  templateBucket = new GridFSBucket(db, { bucketName: 'professorTemplates' });
  return templateBucket;
};

const uploadToGridFS = (buffer, filename) => {
  return new Promise((resolve, reject) => {
    const uploadStream = templateBucket.openUploadStream(filename);
    uploadStream.id = new mongoose.Types.ObjectId(); // Custom ID
    
    uploadStream.on('error', reject);
    uploadStream.on('finish', () => resolve(uploadStream.id));
    
    uploadStream.end(buffer);
  });
};

module.exports = { initGridFS, uploadToGridFS };
