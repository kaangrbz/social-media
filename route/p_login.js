module.exports = async function p_login(req, res, User) {
  const bcrypt = require("bcrypt");
  const saltRounds = 10;
  var { User, Post, UTM, Report } = require("../models/blogs");
  var username = req.body.username ?? ``;
  var userpass = req.body.userpass ?? ``;

  if (!username) {
    res.json({
      message: "You should write a username.",
      error: 1,
    });
  } else if (!userpass) {
    res.json({
      message: "You should write your password.",
      error: 1,
    });
  } else {
    let result = await User.findOne({ username });
    if (!result) {
      res.json({
        message: `There is no user with this name.`,
        error: 1,
      });
    }
    let loginResult = await bcrypt.compare(userpass, result.userpass);

    if (loginResult) {
      console.log(true);
      req.session.id = result._id;
      req.session.userid = result.userid;
      req.session.verified = result.verified;
      req.session.username = result.username;
      req.session.email = result.email;
      req.session.fullname = result.fullname;
      res.json({
        success: 1,
      });
    }
    console.log(false);

    res.json({
      message: "Your password is wrong",
      error: 1,
    });
  }
};
