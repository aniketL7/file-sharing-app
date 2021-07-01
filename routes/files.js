const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const File = require("../models/file");
const { v4: uuid4 } = require("uuid");

const storageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.random() * 1e9}${path.extname(
      file.originalname
    )}`;
    cb(null, uniqueName);
  },
});

let upload = multer({
  storage: storageEngine,
  limits: { fileSize: 1000000 * 100 },
}).single("myfile");

router.post("/", (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).send({ error: err.message });
    }
    // everything went fine,so store into the database
    const file = new File({
      filename: req.file.filename,
      //uuid has been used to make the download end point unique
      uuid: uuid4(),
      path: req.file.path,
      size: req.file.size,
    });
    try {
      const response = await file.save();
      console.log(response);
      res.json({
        file: `${process.env.APP_BASE_URL}/files/${response.uuid}`,
      });
    } catch (err) {
      console.log(err);
    }
  });
});

router.post("/send", async (req, res) => {
  const { uuid, emailTo, emailFrom } = req.body;
  if (!emailTo || !emailFrom || !uuid) {
    res.status(422).send({ error: "All fields are required!" });
  }
  //get data from database
  const file = await File.findOne({ uuid: uuid });
  file.sender = emailFrom;
  file.receiver = emailTo;
  const response = await file.save();

  //send email
  const sendMail = require("../services/emailService");
  sendMail({
    from: emailFrom,
    to: emailTo,
    subject: "File sharing",
    text: `${emailFrom} shared a file with you.`,
    html: require("../services/emailTemplate")({
      emailFrom: emailFrom,
      downloadLink: `${process.env.APP_BASE_URL}/files/${file.uuid}`,
      size: parseInt(file.size / 1000) + " KB",
    }),
  });
  res.send({ success: "true" });
});

module.exports = router;
