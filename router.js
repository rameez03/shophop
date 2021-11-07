const express = require('express');
const app = express();
const path = require('path');

const router = express.Router();
const upload = require('./uploadMiddleware');
const Rename = require('./Rename');
//const fileupload=require('express-fileupload')

router.get('/', async function (req, res) {
  await res.render('index');
});

router.post('/post', upload.single('image'), async function (req, res) {
  
  console.log();
  const documentPath = path.join(__dirname, '../public/documents');
  const fileUpload = new Rename(documentPath);
  //if (!req.file) {
    //res.status(401).json({error: 'Please provide a Document(.pdf)'});
  //}
  if (!req.file) {
    throw Error("FILE_MISSING");
  } else {
    res.send("success");
    const filename = await fileUpload.save(req.file.buffer);
    return res.status(200).json({ name: filename });
  }  
  
});
router.use(function (err, req, res, next) {
  if (err instanceof multer.MulterError) {
    res.statusCode = 400;
    res.send(err.code);
  } else if (err) {
    if (err.message === "FILE_MISSING") {
      res.statusCode = 400;
      res.send("FILE_MISSING");
    } else {
      res.statusCode = 500;
      res.send("GENERIC_ERROR");
    }
  }
});

module.exports = router;