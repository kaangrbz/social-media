module.exports = async function p_login(req, res, User) {
    const md5 = require('md5')
    var {
        User,
        Post,
        UTM,
        Report,
    } = require('../models/blogs')
    var username = req.body.username ?? ``
    var userpass = req.body.userpass ?? ``
    userpass = md5(userpass)
    if (!username) {
        res.json({
            message: 'You should write a username.',
            error: 1
        })
    } else if (!userpass) {
        res.json({
            message: 'You should write your password.',
            error: 1
        })
    } else {
        let result = await User.findOne({ username })
        if (!result) {
            res.json({
                message: `There is no user with this name.`,
                error: 1
            })
        } else if (userpass != result.userpass) {
            res.json({
                message: 'Your password is wrong',
                error: 1
            })
        }
        else {
            req.session.id = result._id;
            req.session.userid = result.userid
            req.session.verified = result.verified
            req.session.username = result.username;
            req.session.email = result.email;
            req.session.fullname = result.fullname;
            res.json({
                success: 1
            })
        }
    }
}