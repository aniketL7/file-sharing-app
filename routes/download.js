const router = require("express").Router();
const { response } = require("express");
const File = require("../models/file");

router.get("/:uuid", async (req, res) => {
  try {
    const file = await File.findOne({ uuid: req.params.uuid });
    if (!file) {
      response.render("download", { error: "Link has been expired!" });
    }
    const filePath = `${__dirname}/../${file.path}`;
    res.download(filePath);
  } catch (err) {}
});

module.exports = router;
