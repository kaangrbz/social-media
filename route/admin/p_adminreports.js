module.exports = async function p_login(req, res, User) {
  const bcrypt = require("bcrypt");
  const saltRounds = 10;
  var { Admin, Report } = require("../../models/blogs");

  if (!req.session.adminusername) res.json({ status: 0 });

  let queryLimit = 20;
  let result = await Report.find({});
  if (!result) {
    res.json({ message: `There is no report.`, success: 1 });
  }
  
};
