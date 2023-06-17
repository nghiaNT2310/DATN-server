const notificationService = require("../services/NotificationService");

async function GetListNotification(req, res, next) {
  const data = await notificationService.getListNotification(req.user.id);
  res.send(data);
}

module.exports = { GetListNotification };
