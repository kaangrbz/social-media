module.exports = async (req, res) => {
  const messages = {
    404: '<br><br><br><div style="text-align:center"><p><h3>Sorry, this page isn\'t available.</h3>The link you followed may be broken, or the page may have been removed. <a href="/" style="color:inherit">Go back to home page</a></p></div>',
  };
  const fs = require("fs");
  var countObj = { users: 10000000, posts: 10000000, reports: 100000000 };
  var userpath = "forbidden/users/user";
  var postpath = "forbidden/posts/post";
  var t = require("../lib/tools.js");
  var { formatDate } = t;
  var { User, Post, UTM, Report } = require("../models/blogs");
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

  if (req.params.username !== "favicon.ico") {
    userid = req.session.userid;
    u1 = req.session.username;
    u2 = req.params.username;
    req.session.nowuser = null;

    notifpath = userpath + userid + "/notifications.json";
    try {
      // check user is not suspended and not private
      u = await User.findOne({ username: u2 }).select(
        "username userid biography verified fullname -_id"
      );
      if (u) {
        userid = u.userid;
        allposts = await Post.find({ userid }).select("postid -_id");
        pcount = allposts.length;
        // console.log('pcount =>', allposts); ///
        try {
          ncount = 0;
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

          fpn2 = userpath + u.userid + "/profile.json";
          fs.readFile(fpn2, (err, data) => {
            data = JSON.parse(data);
            // console.log('data => ', data); ///
            i1 = data.followers.who.indexOf(userid);
            isfollowed = false;
            if (i1 > -1) isfollowed = true;
            res.render("profile", {
              data,
              u1,
              u2,
              isme: u1 === u2,
              verified: u.verified,
              isfollowed,
              u,
              pcount,
              ncount,
            });
          });
        } catch (error) {
          console.log("err => 581 \n", error);
        }
      } else {
        let message = messages[404];
        res.render("404", { message });
      }
    } catch (error) {
      console.log("err => 588", error);
    }
  }
};
