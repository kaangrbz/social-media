module.exports = async function p_likeDislikeComment(req, res) {
  const fs = require("fs");
  var countObj = { users: 10000000, posts: 10000000, reports: 100000000 };
  var userpath = "forbidden/users/user";
  var postpath = "forbidden/posts/post";
  var { createAlternativeUsername, formatDate } = require("../lib/tools.js");
  var unameReg = /^\w+$/;
  var fnameReg = /^[a-zA-Z0-9 ğüşöçİĞÜŞÖÇ]+$/; // with spaace
  var bioReg = /^[a-zA-Z0-9ğüşöçİĞÜŞÖÇ!@#$₺€%^&*() _+"'-]+$/; // with space
  var emailReg =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  var patt = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
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
  var biography;
  var verified;
  // posts folder is exist
  userid = req.session.userid;

  username = req.body.username;
  email = req.body.email || null;
  fullname = req.body.fullname || null;
  biography = req.body.biography || "";
  if (!username) {
    res.json({ message: "Please enter a username", error: 1 });
  } else if (username.length < 4) {
    res.json({ message: "Username must be minimum 4 character", error: 1 });
  } else if (!unameReg.test(username)) {
    res.json({
      message: "Allowed characters for username: A-Z a-z 0-9 _",
      error: 1,
    });
  } else {
    let u = await User.findOne({ username });
    if (username !== req.session.username) {
      if (u) {
        res.json({
          message: "Username is exist try something else.",
          error: 1,
          alternatives: await createAlternativeUsername(username, 4),
        });
      }
    } else {
      if (u.suspend) {
        let message = `Your account is suspended. You can not change your infos. Please send your username or your id <a class="mail" href="mailto:abdikaangrbz@gmail.com">to here</a>`;
        res.json({
          message,
          suspend: 1,
        });
      } else if (!emailReg.test(String(email).toLowerCase()))
        res.json({
          message: "Please enter a valid email, for example: email@example.com",
          error: 1,
        });
      else if (!fullname)
        res.json({
          message: "Please write a name",
          error: 1,
        });
      else if (fullname.length < 5)
        res.json({
          message: "Fullname must be minimum 5 character",
          error: 1,
        });
      else if (!fnameReg.test(fullname))
        res.json({
          message:
            "Allowed characters for fullname: A-Z a-z 0-9 _ ç ı ü ğ ö ş İ Ğ Ü Ö Ş Ç",
          error: 1,
        });
      else if (!biography && biography !== "") {
        if (!bioReg.test(biography))
          res.json({
            message:
              "Allowed characters for biography: A-Z a-z 0-9 _ ç ı ü ğ ö ş İ Ğ Ü Ö Ş Ç ! @ # $ ₺ € % ^ & * ( ) _ + \" ' - ",
            error: 1,
          });
      } else if (biography.length > 500)
        res.json({
          message: "Biography can't more than 500 letters",
          error: 1,
        });
      else {
        //update db
        filter = { userid };
        update = {
          username,
          email,
          fullname,
          biography,
          updatedAt: new Date(),
        };
        User.findOneAndUpdate(filter, update)
          .then((result) => {
            if (result) {
              req.session.username = result.username;
              req.session.email = result.email;
              req.session.fullname = result.fullname;
              res.json({
                message: "Successfuly updated.",
                success: 1,
                username,
                fullname,
                biography
              });
            } else {
              res.json({
                message: "There is a problem with update",
                error: 1,
              });
            }
          })
          .catch((err) => {
            if (err)
              res.json({
                message: "There is a problem with update",
                error: 1,
              });
          });
      }
    }
  }
};
