const Pusher = require("pusher");

let pusher = new Pusher({
  appId: "1629537",
  key: "2931330319b96bd629ce",
  secret: "0afed9c34cfbdb252c6d",
  cluster: "ap2",
});

module.exports = pusher;
