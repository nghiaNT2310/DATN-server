const { CODE_MESSAGE, respond } = require("../services/responseService");

function handleError(err, req, res, next) {
  res.send(respond(CODE_MESSAGE.INTERNAL_SERVER_ERROR));
}

module.exports = { handleError };
