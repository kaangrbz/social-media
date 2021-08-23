module.exports = async function p_login(req, res, User) {
  if (!req.session.adminusername) res.json({ status: 0 });

  async function wait(c) {
    setTimeout(() => {
      console.log("sa");
    }, c * 1000);
  }
  console.clear();

  const { zip } = require("zip-a-folder");
  var dir = __dirname.replace("\\route\\admin", "");
  let date = Date.now();
  var fileName = `backup_${date}.zip`;
  var zipFile = `${dir}/${fileName}`;
  var zipFileName = `${fileName}`;
  class TestMe {
    static async main() {
      await zip(`${dir}/forbidden`, zipFile);
    }
  }
  await TestMe.main();
  res.download(zipFile, zipFileName);
};
