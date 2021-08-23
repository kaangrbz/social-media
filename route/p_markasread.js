module.exports = async (req, res) => {
  const fs = require("fs");
  var userpath = "forbidden/users/user";
  if (!req.session.userid) res.redirect("/login");
  var getJSON = (fullpathname) => {
    return new Promise((resolve, reject) => {
      fs.readFile(fullpathname, (err, data) => {
        if (err) {
          reject(err); // calling `reject` will cause the promise to fail with or without the error passed as an argument
          return; // and we don't want to go any further
        }
        resolve(JSON.parse(data));
      });
    });
  };
  var userid = req.session.userid;
  var userid = req.session.userid;
  var notifpath = userpath + userid + "/notifications.json";
  let notifs = await getJSON(notifpath);
  if (notifs.length > 0) {
    notifs.forEach((notif, i) => {
      if (!notif.read) notifs[i].read = true;
    });
    fs.writeFile(notifpath, JSON.stringify(notifs), (err) => {
      if (err)
        res.json({
          error: 1,
          message: "There is an error. Please try again later",
        });
      res.json({ success: 1 });
    });
  }
};
