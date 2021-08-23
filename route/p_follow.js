module.exports = async function p_login(req, res) {
  const fs = require("fs");
  var { User, Post, UTM, Report } = require("../models/blogs");
  var userpath = "forbidden/users/user";

  if (!req.session.userid) res.json({ status: 0 });
  const getJSON = (fullpathname) => {
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
  username = req.params.username;
  let user = await User.findOne({ username });
  if (user) {
    userid = req.session.userid;
    notlogged_userid = user.userid;
    logged_fpn = userpath + userid + "/profile.json";
    notlogged_fpn = userpath + notlogged_userid + "/profile.json";
    notlogged_notif = userpath + notlogged_userid + "/notifications.json";
    if (fs.existsSync(logged_fpn)) {
      if (fs.existsSync(notlogged_fpn)) {
        try {
          var loggeduser = await getJSON(logged_fpn);
          var notloggeduser = await getJSON(notlogged_fpn);
        } catch (error) {
          message = `Something went wrong while getting user profiles. FOLLOW_3`;
          res.json({
            status: `error`,
            message,
          });
        }

        const index1 = notloggeduser.followers.who.indexOf(userid);
        const index2 = loggeduser.following.who.indexOf(notlogged_userid);
        // console.log(index1, ' and ', index2);
        status = 0;
        if (index1 == -1) {
          // not followed
          notloggeduser.followers.who.unshift(userid);
          notloggeduser.followers.c++;
          loggeduser.following.who.unshift(notlogged_userid);
          loggeduser.following.c++;
          status = `followed`;

          // send notif
          let notif = await getJSON(notlogged_notif);
          notifObj = {
            nid: notif.length + 1,
            userid,
            ncode: `follow`,
            ntime: new Date(),
            read: false,
          };
          notif.unshift(notifObj);
          fs.writeFile(notlogged_notif, JSON.stringify(notif), (err) => {
            if (err) throw err;
          });
        } else {
          // already followed
          notloggeduser.followers.who.splice(index1, 1);
          notloggeduser.followers.c--;
          loggeduser.following.who.splice(index2, 1);
          loggeduser.following.c--;
          status = `unfollowed`;

          // delete follow
          let notif = await getJSON(notlogged_notif);
          var index = -1;
          var filteredObj = notif.find(function (item, i) {
            if (item.userid === userid && item.ncode == `follow`) {
              index = i;
              return i;
            }
          });
          notif.splice(index, 1);
          fs.writeFile(notlogged_notif, JSON.stringify(notif), (err) => {
            if (err) throw err;
          });
        }

        fs.writeFile(notlogged_fpn, JSON.stringify(notloggeduser), (err) => {
          if (err) throw err;
          fs.writeFile(logged_fpn, JSON.stringify(loggeduser), (err) => {
            if (err) throw err;
            res.json({ status });
          });
        });
      } else {
        res.json({
          status: `error`,
          message: "Something went wrong while following. FOLLOW_2",
        });
      }
    } else {
      res.json({
        status: `error`,
        message: "Something went wrong while following. FOLLOW_1",
      });
    }
  } else {
    res.json({
      status: `info`,
      message: "The user named " + req.params.username + " is not exist.",
    });
  }
};
