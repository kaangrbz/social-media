module.exports = async function p_login(req, res) {

    const fs = require('fs')
    var t = require('../lib/tools.js')
    var { createAlternativeUsername } = require('../lib/tools.js')
    var md5 = require('md5')
    var unameReg = /^\w+$/
    var fnameReg = /^[a-zA-Z0-9 ğüşöçİĞÜŞÖÇ]+$/ // with spaace
    var bioReg = /^[a-zA-Z0-9ğüşöçİĞÜŞÖÇ!@#$₺€%^&*() _+"'-]+$/ // with space
    var emailReg = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var patt = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    var {
        User,
        Post,
        UTM,
        Report,
    } = require('../models/blogs')
    var countObj = { users: 10000000, posts: 10000000, reports: 100000000 }
    var userpath = 'forbidden/users/user'
    var postpath = 'forbidden/posts/post'
    username = req.body.username.trim().toLowerCase() || null;
    userpass = req.body.userpass.trim() || null;
    fullname = req.body.fullname.trim() || null;
    email = req.body.email.trim().toLowerCase() || null;

    if (!emailReg.test(String(email))) res.json({ message: 'Please enter a valid email, for example: example@mail.com', error: 1 })
    else if (!fullname) res.json({ message: 'Please write a name', error: 1 })
    else if (fullname.length < 3) res.json({ message: 'Fullname must be minimum 3 character', error: 1 })
    else if (!fnameReg.test(fullname)) res.json({ message: 'Allowed characters for fullname: A-Za-z0-9_çıüğöşİĞÜÖŞÇ', error: 1 })
    else if (!username) res.json({ message: 'Please write an username.', error: 1 })
    else if (username.length < 4) res.json({ message: 'Username must be minimum 4 character.', error: 1 })
    else if (t.isForbiddenUsername(username)) res.json({ message: 'You can not use this username.', error: 1 })
    else if (!unameReg.test(username)) res.json({ message: 'Allowed characters for username: A-Za-z0-9_', error: 1 })
        // create function for forbidden usernames: ataturk etc...
    let u = await User.findOne({ username })
    if (u) {
        res.json({ message: 'Username is exist try something else.', error: 1, alternatives: await createAlternativeUsername(username, 4) })
    } else if (t.isForbiddenUsername(username)) res.json({ message: 'You can not use this username.', error: 1 })
    else if (!userpass) res.json({ message: 'You should write a password', error: 1 })
    else if (userpass.length < 6) res.json({ message: 'Password must be minimum 6 character.', error: 1 })
    else {
        userObj = {
            email,
            fullname,
            username,
            userpass: md5(userpass),
            biography: '',
            visibility: true,
            suspend: false,
            verified: false,
            createdAt: new Date(),
            updatedAt: new Date()
        }

        var lastUser = await User.findOne({}).sort({ createdAt: -1 })
        console.log(lastUser);
        (lastUser) ? userObj.userid = (Number(lastUser.userid) + 1): userObj.userid = countObj.users
        console.log(userObj.userid);
        // // return

        const user = new User(userObj)
            .save()
            .then(result => {
                if (!result) {
                    res.json({ message: 'Sign up is not successfuly, please try again.', error: 1 })
                } else {
                    res.json({ success: 1 })
                }

                pathname = 'forbidden/'
                if (!fs.existsSync(pathname)) {
                    fs.mkdir(pathname, (err) => {
                        if (err) console.log(err)
                    })
                }
                pathname = 'forbidden/users/'
                if (!fs.existsSync(pathname)) {
                    fs.mkdir(pathname, (err) => {
                        if (err) console.log(err)
                    })
                }
                console.log('result.userid => ', result.userid);
                pathname = userpath + result.userid
                if (!fs.existsSync(pathname)) {
                    fs.mkdir(pathname, (err) => {
                        if (err) console.log(err)
                    })
                    files = ['profile', 'blocked', 'notifications', 'liked', 'saved']
                    userObjs = [{
                            userid: result.userid,
                            followers: {
                                c: 0,
                                who: []
                            },
                            following: {
                                c: 0,
                                who: []
                            },
                            createdAt: new Date(),
                            updatedAt: new Date()
                        },
                        [],
                        [],
                        [],
                        []
                    ]
                    files.forEach((file, index) => {
                        fullpathname = pathname + '/' + file + ".json"
                        fs.writeFile(fullpathname, JSON.stringify(userObjs[index]), (err) => {
                            if (err) console.log(err);
                        })
                    });
                }
            })
            .catch((error) => {
                console.log(error);
                res.json({ message: 'Sign up is not successfuly, please try again later.', error: 1 })
            })
    }
}