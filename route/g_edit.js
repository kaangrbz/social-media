module.exports = async (req, res) => {
  const fs = require("fs");
  var userpath = "forbidden/users/user";
  var { User, Post } = require("../models/blogs");
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
  var biography;
  var verified;
  // posts folder is exist
  if (!req.session.userid) res.redirect("/login");
  username = req.session.username;
  email = req.session.email;
  fullname = req.session.fullname;
  userid = req.session.userid;
  let b = await User.findOne({ username }).select(
    "biography userid verified -_id"
  );
  if (b) {
    data = await getJSON(fpn);
    fpn = userpath + b.userid + "/profile.json";
    allposts = await Post.find({ userid }).select("postid -_id");
    pcount = allposts.length;
    ncount = 0;
    notifpath = userpath + userid + "/notifications.json";
    notifs = await getJSON(notifpath);
    biography = b.biography;
    verified = b.verified;
    if (notifs.length > 0) {
      notifs.forEach((notif, i) => {
        if (!notif.read) ncount++;
      });
    }
    res.render("editprofile", {
      u1: username,
      username,
      email,
      userid,
      fullname,
      biography,
      data,
      verified,
      pcount,
      ncount,
    });
  } else
    res.render("editprofile", {
      u1: username,
      username,
      email,
      userid,
      fullname,
    });
};
