module.exports = async function p_likeDislikeComment(req, res) {
  const fs = require("fs");
  var countObj = { users: 10000000, posts: 10000000, reports: 100000000 };
  var userpath = "forbidden/users/user";
  var postpath = "forbidden/posts/post";
  var t = require("../lib/tools.js");
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
  fullpathname = postpath + req.params.postid + ".json";
  userid = req.session.userid;

  postid = req.params.postid;
  ecode = req.params.ecode;
  status = 0;
  // posts folder is exist
  if (!fs.existsSync(fullpathname)) {
    message = `An unknown error has occurred. Please try again later.`;
    res.json({
      status: `error`,
      message,
    });
  } else {
    var data = await getJSON(fullpathname);
    if (typeof data != `object` && typeof data == `string`) {
      data = JSON.parse(data);
    }

    whoposted = data.userid;
    i1 = data.likes.who.indexOf(userid);
    i2 = data.dislikes.who.indexOf(userid);
    //-----------------------------like--------------------------------//
    if (ecode == `like`) {
      if (i1 == -1 && i2 == -1) {
        status = `liked`;
        data.likes.c++;
        data.likes.who.unshift(userid);
        if (whoposted !== userid) {
          fpn = userpath + whoposted + "/notifications.json";
          getJSON(fpn)
            .then((notif) => {
              notifObj = {
                nid: notif.length + 1,
                userid: userid,
                postid,
                ncode: `like`,
                ntime: new Date(),
                read: false,
              };
              notif.unshift(notifObj);
              fs.writeFile(fpn, JSON.stringify(notif), (err) => {
                if (err) throw err;
              });
            })
            .catch((err) => {
              console.log("728 err => ", err);
            });
        }
      } else if (i1 > -1 && i2 == -1) {
        status = `unliked`;
        data.likes.c--;
        data.likes.who.splice(i1, 1);

        if (whoposted !== userid) {
          // delete like
          fpn = userpath + whoposted + "/notifications.json";
          getJSON(fpn)
            .then((notif) => {
              var index = -1;
              var filteredObj = notif.find(function (item, i) {
                if (item.userid === userid && item.ncode == `like`) {
                  index = i;
                  return i;
                }
              });
              notif.splice(index, 1);
              fs.writeFile(fpn, JSON.stringify(notif), (err) => {
                if (err) throw err;
              });
            })
            .catch((err) => console.error("743 => ", err));
        }
      } else if (i1 == -1 && i2 > -1) {
        status = `liked_while_disliked`;
        data.dislikes.c--;
        data.dislikes.who.splice(i2, 1);
        data.likes.c++;
        data.likes.who.unshift(userid);
        if (whoposted !== userid) {
          fpn = userpath + whoposted + "/notifications.json";
          getJSON(fpn)
            .then((notif) => {
              notifObj = {
                nid: notif.length + 1,
                userid,
                postid,
                ncode: `like`,
                ntime: new Date(),
                read: false,
              };
              notif.unshift(notifObj);
              fs.writeFile(fpn, JSON.stringify(notif), (err) => {
                if (err) throw err;
              });
            })
            .catch((err) => {
              console.log("728 err => ", err);
            });
        }
      } else {
        res.json({
          status: `error`,
          message: `An unknown error has occurred. Please try again later.`,
        });
      }
      fs.writeFile(fullpathname, JSON.stringify(data), (err) => {
        if (err) throw err;
      });
      res.json({
        status,
      });
    }

    //----------------------------dislike---------------------------------//
    else if (ecode == `dislike`) {
      if (i1 == -1 && i2 == -1) {
        status = `disliked`;
        data.dislikes.c++;
        data.dislikes.who.unshift(req.session.userid);
      } else if (i1 == -1 && i2 > -1) {
        status = `undisliked`;
        data.dislikes.c--;
        data.dislikes.who.splice(i2, 1);
      } else if (i1 > -1 && i2 == -1) {
        status = `disliked_while_liked`;
        data.likes.c--;
        data.likes.who.splice(i1, 1);
        data.dislikes.c++;
        data.dislikes.who.unshift(req.session.userid);
      }
      fs.writeFile(fullpathname, JSON.stringify(data), (err) => {
        if (err) throw err;
        res.json({
          status,
        });
      });
    }

    //-----------------------------comment--------------------------------//
    else if (ecode == `comment`) {
      // comment to post
      message = req.body.message || "";
      limit = 500;
      if (message.length > limit) {
        message = message.substring(0, limit);
      }
      data.comments.c++;
      data.comments.who.unshift({
        userid,
        message,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      status = 1;
      if (whoposted !== userid) {
        fpn = userpath + whoposted + "/notifications.json";
        let notif = await getJSON(fpn);
        var msgOutput = message;
        if (msgOutput.length > 20) {
          msgOutput = message.splice(0, 20) + `...`;
        }
        notifObj = {
          nid: notif.length + 1,
          userid,
          postid,
          ncode: `comment`,
          commenttext: `${msgOutput}`,
          ntime: new Date(),
          read: false,
        };
        notif.unshift(notifObj);
        fs.writeFile(fpn, JSON.stringify(notif), (err) => {
          if (err) throw err;
        });
      }
      fs.writeFile(fullpathname, JSON.stringify(data), (err) => {
        if (err) throw err;
        res.json({
          status,
          username: req.session.username,
          message,
          date: t.formatDate(new Date(), "fulldate"),
          isverified: req.session.verified,
        });
      });

      // // if delete the comment
      // getJSON(fullpathname3)
      // .then(notif => {
      //    var index = -1;
      //    var filteredObj = notif.find(function (item, i) {
      //       if (item.nuser === req.session.username && item.ncode == 2) { index = i; return i; }
      //    });

      //    notif.splice(index, 1)
      //    fs.writeFile(fullpathname3, JSON.stringify(notif), err => {
      //       if (err) throw err
      //    })
      // }).catch(err => console.error('885 => ', err))
    }
  }
};
