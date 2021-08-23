module.exports = async (req, res) => {
  const fs = require("fs");
  var userpath = "forbidden/users/user";
  var t = require("../lib/tools.js");
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

  req.session.nowuser = null;
  if (!req.session.userid) res.redirect("/login");
  userid = req.session.userid;
  u1 = req.session.username;
  // console.log('pcount =>', allposts); ///
  try {
    var ncount = 0;
    if (req.session.userid) {
      // if it is not visitor. logged in
      userid = req.session.userid;
      notifpath = userpath + userid + "/notifications.json";
      let notifs = await getJSON(notifpath);
      if (notifs.length > 0) {
        notifs.forEach((notif, i) => {
          if (!notif.read) ncount++;
        });
      }
    }
    res.render("explore", { ncount, u1 });
  } catch (error) {
    console.log("err => 38 \n", error);
  }
};