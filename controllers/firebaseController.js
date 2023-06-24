const fileBaseService = require("../services/firebaseService");

async function uploadFile(req, res, next) {
  try {
    console.log(req.files.image);
    await fileBaseService.uploadFile(req.files.image);
    res.send("oks");
  } catch (err) {
    console.log(err);
    res.send(err);
  }
}

async function getLinkDownload(req, res, next) {
  try {
    url = await fileBaseService.getUrl(req.query.name);
    res.send(url);
  } catch (err) {
    console.log(err);
    res.send(err);
  }
}

module.exports = { uploadFile, getLinkDownload };
