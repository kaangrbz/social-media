module.exports = async function p_login(req, res, User) {
    const bcrypt = require("bcrypt");
    const saltRounds = 10;
    var { Admin } = require("../../models/blogs");
    var adminusername = req.body.adminusername ?? ``;
    var adminuserpass = req.body.adminuserpass ?? ``;
  
    if (!adminusername) {
      res.json({
        message: "You should write a username.",
        error: 1,
      });
    } else if (!adminuserpass) {
      res.json({
        message: "You should write your password.",
        error: 1,
      });
    } else {
      let result = await Admin.findOne({ adminusername });
      if (!result) {
        res.json({
          message: `There is no user with this name.`,
          error: 1,
        });
      }
      let loginResult = await bcrypt.compare(adminuserpass, result.adminuserpass);
  
      if (loginResult) {
        req.session.adminusername = result.adminusername;
        req.session.username = result.adminusername;
        req.session.userid = 10000000;
        res.json({
          success: 1,
        });
      }  
      res.json({
        message: "Your password is wrong",
        error: 1,
      });
    }
  };
  