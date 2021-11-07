const multer = require('multer');

const upload = multer({
  limits: {
    fileSize:10*1024*1024,
    dest:"../public/documents"
  }
});

module.exports = upload;