const { format } = require("timeago.js");

module.exports = async function p_likeDislikeComment(req, res) {
  const fs = require("fs");
  var countObj = { users: 10000000, posts: 10000000, reports: 100000000 };
  var userpath = "forbidden/users/user";
  var postpath = "forbidden/posts/post";
  var t = require("../lib/tools.js");
  var { formatDate } = t;
  var { User, Post, UTM, Report } = require("../models/blogs");
  if (!req.session.userid) res.json({ status: 0 });
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

  if (req.session.notifuser !== username) {
    req.session.notifuser = username;
    lastnotif = 0;
  }
  var nlimit = 10;
  var users = [];
  var dates = [];
  var userid = req.session.userid;
  var fpn = userpath + userid + "/notifications.json";
  let notifs = await getJSON(fpn);
  notifs = notifs.splice(0, nlimit);
  var nl = notifs.length;
  if (nl > 0) {
    var result = [];
    for (let i = 0; i < nl; i++) {
      var user;
      let notif = notifs[i];
      let notifObj = {
        username: "",
        userid: notif.userid,
        postid: notif.postid ? notif.postid : ``,
        ncode: notif.ncode,
        ntime: formatDate(new Date(notif.ntime), "timeago"),
        read: notif.read,
      };
      if (notif.ncode === `comment`) {
        notifObj.commenttext = notif.commenttext ?? "...";
      }
      if (notif.userid) {
        user = await User.findOne({ userid: notif.userid });
        if (user) notifObj.username = user.username;
        else notifObj.username = `deleted_user`;
      }
      result.push(notifObj);
      if (i == nl - 1) {
        lastnotif += nlimit;
        res.json({ status: 2, result });
      }
    }
  } else {
    //has not notif
    res.json({ result: [] });
  }
};
