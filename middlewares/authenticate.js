var jwt = require("jsonwebtoken");
const { handleError } = require("../services/handleErrorService");

function authenticate(req, res, next) {
  try {
    token = req.headers.authorization.split(" ")[1];
    var decoded = jwt.verify(token, process.env.JWT_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    handleError(err);
    next(err);
  }
}

module.exports = { authenticate };
