module.exports = async function p_login(req, res) {
  const fs = require("fs");
  var { User, Post, UTM, Report, Count } = require("../models/blogs");
  var userpath = "forbidden/users/user";

  var countObj = { users: 10000000, posts: 10000000, reports: 100000000 };
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
  userid = req.session.userid;
  if (!req.params.postid)
    res.json({ status: 2, message: "Wrong post number." });
  if (req.params.username == "favicon.ico") return;
  postid = req.params.postid;
  reportnumber = req.body.reportnumber;
  reporttext = req.body.reporttext.trim();
  reportlimit = 5;

  let post = await Post.findOne({ userid, postid }); // if the owner and the reporting person are the same
  if (!post) {
    var start = new Date();
    start.setHours(0, 0, 0, 0);
    var end = new Date();
    end.setHours(23, 59, 59, 999);
    // find logged user's reports on today, if > reportlimit send msg: 'You report much post today'
    let reports = await Report.find({
      userid,
      createdAt: { $gte: start, $lt: end },
    });
    if (reports.length === reportlimit) {
      res.json({
        status: 2,
        message: "You have exceeded your reporting limit. Try again tomorrow.",
      });
    }
    // if not exeedeed reportlimit

    var reportcount = await Count.findOneAndUpdate(
      {},
      { $inc: { reports: 1 } }
    );
    console.log(reportcount);
    // // return
    if (!reportcount) {
      reportcount = countObj.reports;
      let count = await new Count(countObj).save();
    }
    var reportObj = {
      reportid: reportcount,
      userid,
      postid,
      reportnumber,
      reporttext: escape(reporttext),
      reportlang: "tr",
      status: 0,
    };

    let report = await new Report(reportObj).save();
    console.log(`p_report 71 report ${report}`);
    if (report) {
      res.json({ status: 1, reportid: report.reportid });
    }
    res.json({
      status: 2,
      message: "Something went wrong. Please try again later.",
    });
  } else {
    res.json({ status: 2, message: "You can not report your post." });
  }
};
