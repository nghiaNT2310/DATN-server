var OpenVidu = require("openvidu-node-client").OpenVidu;

// Environment variable: URL where our OpenVidu server is listening
var OPENVIDU_URL = process.env.OPENVIDU_URL || "http://localhost:4443";
// Environment variable: secret shared with our OpenVidu server
var OPENVIDU_SECRET = process.env.OPENVIDU_SECRET || "MY_SECRET";
var openvidu = new OpenVidu(OPENVIDU_URL, OPENVIDU_SECRET);

async function CreateSessionId(req, res) {
  var session = await openvidu.createSession(req.body);
  res.send(session.sessionId);
}

async function CreateSession(req, res) {
  var session = openvidu.activeSessions.find(
    (s) => s.sessionId === req.params.sessionId
  );
  if (!session) {
    res.status(404).send();
  } else {
    var connection = await session.createConnection(req.body);
    res.send(connection.token);
  }
}

module.exports = { CreateSessionId, CreateSession };
