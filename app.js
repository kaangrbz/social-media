const express = require('express')
const app = express()
const ejs = require('ejs')
const bodyparser = require('body-parser')

const session = require('express-session')
const mongoose = require('mongoose')
const slugify = require('@sindresorhus/slugify');
const path = require('path')
const fs = require('fs')
const multer = require('multer')
const morgan = require('morgan')
require('dotenv').config() //process.env.
const { format, render, cancel, register } = require('timeago.js');
var t = require('./lib/tools.js')
var { createFolders } = t
app.set('view engine', 'ejs')
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use('/timeago', express.static(__dirname + '/node_modules/timeago.js/dist'));
app.use(express.static(path.join(__dirname, 'src')));
app.use(express.static(path.join(__dirname, 'src/css')));

var {
    User,
    Post,
    UTM,
    Report,
} = require('./models/blogs')
var countObj = { users: 10000000, posts: 10000000, reports: 100000000 }
var userpath = 'forbidden/users/user'
var postpath = 'forbidden/posts/post'

var unameReg = /^\w+$/
var fnameReg = /^[a-zA-Z0-9 ğüşöçİĞÜŞÖÇ]+$/ // with spaace
var bioReg = /^[a-zA-Z0-9ğüşöçİĞÜŞÖÇ!@#$₺€%^&*() _+"'-]+$/ // with space
var emailReg = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
var patt = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;


const g_edit = require('./route/g_edit')
const p_edit = require('./route/p_edit')
const p_login = require('./route/p_login')
const p_signup = require('./route/p_signup')
const p_post = require('./route/p_post')
const p_notif = require('./route/p_notif')
const p_likeDislikeComment = require('./route/p_likeDislikeComment')


createFolders()
    // Set The Storage Engine
const storage = multer.diskStorage({
    destination: './inc/uploads/posts/',
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Init Upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 2621440 },
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb);
    }
}).single('media');


// Check File Type
function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif|mp4/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Allowed extensions .jpeg .jpg .png .gif .mp4!');
    }
}



const messages = {
    "404": '<br><br><br><div style="text-align:center"><p><h3>Sorry, this page isn\'t available.</h3>The link you followed may be broken, or the page may have been removed. <a href="/" style="color:inherit">Go back to home page</a></p></div>',
}

const getJSON = (fullpathname) => {
    return new Promise((resolve, reject) => {
        fs.readFile(fullpathname, (err, data) => {
            if (err) {
                reject(err) // calling `reject` will cause the promise to fail with or without the error passed as an argument
                return // and we don't want to go any further
            }
            resolve(JSON.parse(data))
        })
    })
}
const dbURL = "mongodb+srv://" + process.env.DBUSERNAME + ":" + process.env.DBUSERPASS + "@cluster0.k4rvg.mongodb.net/" + process.env.DBNAME + "?retryWrites=true&w=majority"

// setInterval(()=>{
//    console.log('im the interval on server side')
// },1000)

var db = mongoose.connect(dbURL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
    })
    .then((result) => {
        console.log('connected to db');
    })
    .catch((err) => {
        console.log('db error')
        return
    })

app.use(bodyparser.urlencoded({ extended: false }));

// 25.12.2020 19:04

app.use(session({
    secret: 'secret key',
    resave: false,
    saveUninitialized: true,
    cookie: { ///
        // httpOnly: false, // minimize risk of XSS attacks by restricting the client from reading the cookie
        // secure: false, // only send cookie over https
        maxAge: 2629800000 // set cookie expiry length in ms // 2629800000 = 1 month
    }
}));

// ## ROUTES ##
// app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))

// app.get('*', function (req, res) { // for maintenance
// 	res.render('maintenance')
// })

app.route('/search')
    .get((req, res) => {
        res.redirect('/')
    })
    .post(async(req, res) => {
        console.log('req.body.searchData =>', req.body.searchData);
        let posts = await Post.find({ article: req.body.searchData }).limit(4).sort({ createdAt: -1 })
        let users = await User.find({ username: req.body.searchData }).limit(4).sort({ createdAt: -1 })

        console.log('127 posts =>', posts);
        console.log('127 users =>', users);
        if (req.session.userid) {} else {
            res.json({
                status: 0
            })
        }
    })

app.route('/sitemap')
    .get((req, res) => {
        res.sendFile(__dirname + '/sitemap.xml')
    })

app.get('/posts/*', function(req, res, next) {
    res.redirect('/')
});
app.get('/users/*', function(req, res, next) {
    res.redirect('/')
});

var sitename = 'devkaan test social media site'
app.route('/from/:adress')
    .get((req, res) => {
        res.redirect('/')
    })
    .post((req, res) => {
        try {
            adress = req.params.adress
        } catch (error) {
            adress = null
            console.log(error);
        }
        console.log(adress);
        if (adress) {
            let utm = new UTM({
                fromwhere: adress,
                whoadded: (req.session.userid) ? req.session.userid : 'visitor',
                whichsite: sitename
            }).save(result => {
                console.log('145 =>', result);
                if (result) {
                    res.json({ status: 1 })
                } else { res.json({ status: 2, message: 'utm_source could not added' }) }
            })
        }
    })

pindex = 5
app.route('/') // home
    .get(async(req, res) => {
        req.session.nowuser = null
        if (req.session.userid) {
            u1 = req.session.username
            try {
                userid = req.session.userid
                ncount = 0
                notifpath = userpath + userid + '/notifications.json'
                let notifs = await getJSON(notifpath)
                if (notifs.length > 0) {
                    notifs.forEach((notif, i) => {
                        if (!notif.read) ncount++
                    })
                }
                res.render('index', { u1, ncount })
            } catch (e) {
                res.render('index')
            }
        } else {
            res.redirect('/login')
        }
    })

app.route('/login')
    .get((req, res) => {
        if (req.session.username) {
            res.redirect('/')
        } else {
            res.render('login')
        }
    })
    .post(async(req, res) => {
        await p_login(req, res)
    })


app.route('/signup')
    .get((req, res) => {
        res.render('signup')
    })
    .post(async(req, res) => {
        await p_signup(req, res)
    })

app.get('/logout', (req, res) => {
    req.session.destroy()
    res.redirect('/')
})
app.route('/edit')
    .get(async(req, res) => {
        await g_edit(req, res)
    })
    .post(async(req, res) => {
        await p_edit(req, res)
        
        
    })
app.route('/markasread')
    .get((req, res) => {
        res.redirect('/')
    })
    .post(async(req, res) => {
        if (req.session.userid) {
            userid = req.session.userid
            ncount = 0
            notifpath = userpath + userid + '/notifications.json'
            let notifs = await getJSON(notifpath)
            if (notifs.length > 0) {
                notifs.forEach((notif, i) => {
                    console.log('--------------------------------------------- 734');
                    if (!notif.read) notifs[i].read = true
                })
                fs.writeFile(notifpath, JSON.stringify(notifs), err => {
                        if (err) res.json({ status: 2, message: 'There is an error. Please try again later' })
                        res.json({ status: 1 })
                    })
                    // console.log(notifs);
            }
        } else {
            res.json({ status: 0 })
        }
    })
app.route('/notif/')
    .get((req, res) => {
        res.redirect('/')
    })
    .post(async(req, res) => {
        p_notif(req, res)
    })

app.route('/help')
    .get((req, res) => {
        res.render('help')
    })

app.route('/explore')
    .get(async(req, res) => {
        req.session.nowuser = null
        if (req.session.userid) {
            userid = req.session.userid;
            u1 = req.session.username;
            // console.log('pcount =>', allposts); /// 
            try {
                var ncount = 0;
                if (req.session.userid) { // if it is not visitor. logged in
                    userid = req.session.userid;
                    notifpath = userpath + userid + '/notifications.json';
                    let notifs = await getJSON(notifpath)
                    if (notifs.length > 0) {
                        notifs.forEach((notif, i) => {
                            if (!notif.read) ncount++
                        })
                    }
                }
                res.render('explore', { ncount, u1, })
            } catch (error) {
                console.log('err => 581 \n', error);
            }
        } else {
            res.render('login');
        }
    })

app.route('/:username') // :profile ////
    .get(async(req, res) => {
        if (req.params.username !== 'favicon.ico') {
            userid = req.session.userid
            u1 = req.session.username
            u2 = req.params.username
            req.session.nowuser = null

            notifpath = userpath + userid + '/notifications.json';
            try {
                // check user is not suspended and not private
                u = await User.findOne({ username: u2 }).select('username userid biography verified fullname -_id')
                if (u) {
                    userid = u.userid
                    allposts = await Post.find({ userid }).select('postid -_id')
                    pcount = allposts.length
                        // console.log('pcount =>', allposts); /// 
                    try {
                        ncount = 0
                        if (req.session.userid) { // if it is not visitor. logged in
                            userid = req.session.userid
                            notifpath = userpath + userid + '/notifications.json'
                            let notifs = await getJSON(notifpath)
                            if (notifs.length > 0) {
                                notifs.forEach((notif, i) => {
                                    if (!notif.read) ncount++
                                })
                            }
                        }

                        fpn2 = userpath + u.userid + '/profile.json'
                        fs.readFile(fpn2, (err, data) => {
                            data = JSON.parse(data)
                                // console.log('data => ', data); /// 
                            i1 = data.followers.who.indexOf(userid)
                            isfollowed = false
                            if (i1 > -1) isfollowed = true;
                            res.render('profile', { data, u1, u2, isme: (u1 === u2), verified: u.verified, isfollowed, u, pcount, ncount })
                        })
                    } catch (error) {
                        console.log('err => 581 \n', error);
                    }
                } else {
                    let message = messages[404];
                    res.render('404', { message })
                }
            } catch (error) {
                console.log('err => 588', error);
            }
        }
    })

app.route('/:username/getpost')
    .get((req, res) => {
        res.redirect('/')
    })
    .post(async(req, res) => {
        if (req.params.username !== 'favicon.ico') {
            username = req.params.username
            userid = req.session.userid
        }
        if (req.session.nowuser !== username) {
            req.session.nowuser = username
            pcount = 0;
            pid = 999999999999999;
            isverified = [];
            ismine = [];
            usernames = [];
            isfirst = true;
        }

        // for index page
        if (username === 'index') {
            plimit = 10
            result = [];
            try {
                fpn = userpath + userid + '/profile.json'
                let profiledata = await getJSON(fpn)
                dl = profiledata.following.who.length // DataLength
                if (dl === 1) {
                    // following just one guy
                    followingid = profiledata.following.who[0]
                    let user = await User.findOne({ userid: followingid, visibility: true, suspend: false }).select('username userid verified -_id')
                    if (user) {
                        // user is not suspended and not private account
                        // check user is blocked or if blocks the user [delete from json file]
                        let posts = await Post.find({ userid: user.userid, postid: { $lt: pid }, visibility: true }).limit(plimit).sort({ createdAt: -1 })
                        let status = 3
                        if (posts.length > 0) {
                            // has post
                            status = 4
                            pid = posts[posts.length - 1].postid // artirma olayini hallet
                                // console.log('517 pid =>', pid); /// 
                            for (let index = 0; index < posts.length; index++) {
                                post = posts[index];
                                postfilepath = postpath + post.postid + '.json'

                                postfile = await getJSON(postfilepath)
                                postObj = {
                                    postid: post.postid,
                                    userid: post.userid,
                                    username: user.username,
                                    post: {
                                        attacments: post.attacments,
                                        article: post.article,
                                        counts: [postfile.likes.c, postfile.dislikes.c, postfile.comments.c],
                                        createdAt: post.createdAt,
                                        updatedAt: post.updatedAt,
                                    },
                                    is_verified_user: user.verified,
                                    last_comment: null,
                                    is_liked: postfile.likes.who.includes(userid),
                                    is_disliked: postfile.dislikes.who.includes(userid),
                                }
                                result.push(postObj)
                                if ((index + 1) === posts.length) { // if last item
                                    res.json({
                                        status,
                                        viewer_username: req.session.username,
                                        viewer_userid: req.session.userid,
                                        result
                                    })
                                }
                            }
                        } else {
                            // has not post
                            let message = '<br><br>The person you follow has no post or you\'ve reached to bottom.<br><br>';
                            res.json({
                                status,
                                result: null,
                                message
                            })
                        }
                    } else {
                        // user is suspended or private account
                        console.log('539 no user');
                        let message = 'The user is suspended or private account.'
                        res.json({
                            status: 3,
                            result: null,
                            message
                        })
                    }
                } else if (dl > 1) {
                    userids = profiledata.following.who;
                    var users = await User.find({ userid: userids, visibility: true, suspend: false }).select('username userid verified -_id')

                    if (users.length > 0) {
                        plimit = 10;
                        let posts = await Post.find({ userid: userids, visibility: true, postid: { $lt: pid } }).limit(plimit).sort({ createdAt: -1 });
                        // console.log('768 posts =>', posts.length);
                        if (posts.length > 0) {
                            // has post
                            status = 4
                            pid = posts[posts.length - 1].postid // artirma olayini hallet
                                // console.log('517 pid =>', pid); /// 
                            for (let index = 0; index < posts.length; index++) {
                                post = posts[index];
                                postfilepath = postpath + post.postid + '.json'

                                is_verified_user = false;
                                var filteredObj = users.find((item, i) => {
                                    if (item.verified) { is_verified_user = true; return i; }
                                });

                                var filteredObj = users.find((item2, i) => {
                                    if (item2.userid == post.userid) { post_username = item2.username; return i; }
                                });

                                postfile = await getJSON(postfilepath)
                                postObj = {
                                    postid: post.postid,
                                    userid: post.userid,
                                    username: post_username,
                                    post: {
                                        attacments: post.attacments,
                                        article: post.article,
                                        counts: [postfile.likes.c, postfile.dislikes.c, postfile.comments.c],
                                        createdAt: post.createdAt,
                                        updatedAt: post.updatedAt,
                                    },
                                    is_verified_user: is_verified_user,
                                    last_comment: null,
                                    is_liked: postfile.likes.who.includes(userid),
                                    is_disliked: postfile.dislikes.who.includes(userid),
                                }
                                result.push(postObj)
                                if ((index + 1) === posts.length) { // if last item
                                    res.json({
                                        status,
                                        viewer_username: req.session.username,
                                        viewer_userid: req.session.userid,
                                        result
                                    })
                                }
                            }
                        } else {
                            let message = "The users you follow do not have any post(s).";
                            res.json({
                                status: 3,
                                result: null,
                                message
                            })
                        }
                    } else {
                        let message = "The users you follow are suspended.";
                        res.json({
                            status: 3,
                            result: null,
                            message
                        })
                    }
                } else {
                    // console.log('544'); ///
                    let message = "You don't follow anyone.";
                    res.json({
                        status: 3,
                        result: null,
                        message
                    })
                }
            } catch (error) {
                console.log('err => 494\n', error);
            }
        } else if (username === 'explore') {
            plimit = 10;
            result = [];
            userid = req.session.userid;
            try {

                let posts = await Post.find({ userid: { $not: { $eq: userid } }, postid: { $lt: pid }, visibility: true }).limit(plimit).sort({ createdAt: -1 })
                posts = t.shuffle(posts);

                let status = 3
                if (posts.length > 0) {
                    // has post
                    status = 4
                    pid = posts[posts.length - 1].postid // artirma olayini hallet
                        // console.log('517 pid =>', pid); /// 
                    for (let index = 0; index < posts.length; index++) {
                        post = posts[index];
                        let current_user = await User.findOne({ userid: post.userid }).select('username userid verified -_id');
                        postfilepath = postpath + post.postid + '.json'

                        postfile = await getJSON(postfilepath)
                        postObj = {
                            postid: post.postid,
                            userid: post.userid,
                            username: current_user.username,
                            post: {
                                attacments: post.attacments,
                                article: post.article,
                                counts: [postfile.likes.c, postfile.dislikes.c, postfile.comments.c],
                                createdAt: post.createdAt,
                                updatedAt: post.updatedAt,
                            },
                            is_verified_user: current_user.verified,
                            last_comment: null,
                            is_liked: postfile.likes.who.includes(userid),
                            is_disliked: postfile.dislikes.who.includes(userid),
                        }
                        result.push(postObj)
                        if ((index + 1) === posts.length) { // if last item
                            res.json({
                                status,
                                viewer_username: req.session.username,
                                viewer_userid: req.session.userid,
                                result,
                            })
                        }
                    }
                } else {
                    // has not post
                    let message;
                    (!isfirst) ? message = "<br><br>There is nothing to discover right now, yet.<br><br>": message = "<br><br>There is nothing more to discover.<br><br>";
                    res.json({
                        status,
                        result: null,
                        message
                    })
                }
            } catch (error) {
                console.log('err => 912\n', error);
            }
        }
        // if unexpected username
        else if (!unameReg.test(username)) {
            let message = 'Wrongusername'
            res.json({
                status,
                result: null,
                message
            })
        }
        // for profile page
        else {
            plimit = 8;
            result = [];
            var is_me = false;
            let user = await User.findOne({ username, visibility: true })

            status = 3
            if (user) {
                if (!user.suspend) { // user is not suspended
                    if (user.userid === req.session.userid) {
                        is_me = true;
                        // if is me => true because i will load visibility: false post like 'you set the visibility: false'
                        posts = await Post.find({ userid: user.userid, postid: { $lt: pid } }).limit(plimit).sort({ createdAt: -1 })
                    } else {
                        // if is me => false do not load posts that visibility: false OK>
                        posts = await Post.find({ userid: user.userid, postid: { $lt: pid }, visibility: true }).limit(plimit).sort({ createdAt: -1 })
                    }
                    if (posts.length > 0) {
                        // has post
                        isfirst = false // for 'you have no post, share now' and 'you have no more post. let\'s share more'
                        status = 1
                        try {
                            pid = posts[posts.length - 1].postid; // artirma olayini hallet

                            // console.log('624 pid =>', pid); /// 
                            (user.verified) ? isverified = 1: isverified = 0;
                            (user.userid === req.session.userid) ? ismine = 1: ismine = 0;
                            // posts.forEach((post, index) => {

                            // })

                            // (post.visibility) ? visibility.push(1) : visibility.push(0)

                            //ismine ++
                            for (let index = 0; index < posts.length; index++) {
                                post = posts[index];
                                postfilepath = postpath + post.postid + '.json'

                                is_verified_user = false;
                                // var filteredObj = users.find((item, i) => {
                                //    if (item.verified) { is_verified_user = true; return i; }
                                // });

                                // var filteredObj = users.find((item2, i) => {
                                //    if (item2.userid == post.userid) { post_username = item2.username; return i; }
                                // });

                                postfile = await getJSON(postfilepath)
                                postObj = {
                                    postid: post.postid,
                                    userid: post.userid,
                                    username: user.username,
                                    post: {
                                        attacments: post.attacments,
                                        article: post.article,
                                        counts: [postfile.likes.c, postfile.dislikes.c, postfile.comments.c],
                                        createdAt: post.createdAt,
                                        updatedAt: post.updatedAt,
                                        visibility: post.visibility,
                                    },
                                    is_me: is_me,
                                    is_verified_user: is_verified_user,
                                    last_comment: null,
                                    is_liked: postfile.likes.who.includes(userid),
                                    is_disliked: postfile.dislikes.who.includes(userid),
                                }
                                result.push(postObj)
                                if ((index + 1) === posts.length) { // if last item
                                    res.json({
                                        status,
                                        viewer_username: req.session.username,
                                        viewer_userid: req.session.userid,
                                        result
                                    })
                                }
                            }
                        } catch (error) {
                            console.log('649 catch =>', error);
                        }
                    } else {
                        // has not post
                        // let message

                        res.json({
                            status,
                            result: null
                        })
                    }
                    // let message = 'user'
                    // res.json({
                    //    status,
                    //    result: null,
                    //    message
                    // })
                } else {
                    // if user is suspended !!
                    let status = 5;
                    res.json({
                        status,
                        result: null,
                    })
                }
            } else {
                // if user is not exist
                let message = '';
                res.json({
                    status,
                    result: null,
                    message
                })
            }
        }
    })




app.route('/post')
    .get((req, res) => {
        if (req.session.username) {
            res.redirect('/')
        } else {
            res.render('login', { data: null })
        }
    })
    .post(async(req, res) => {
        await p_post(req, res)
    })

app.route('/:ecode/:postid/event')
    .get((req, res) => {
        res.redirect('/')
    })
    .post((req, res) => {
        p_likeDislikeComment(req, res)
    })

app.route('/:username/follow')
    .get((req, res) => {
        res.redirect('/')
    })
    .post(async(req, res) => {
        if (req.session.userid) {
            username = req.params.username
            let user = await User.findOne({ username })
            if (user) {
                userid = req.session.userid
                notlogged_userid = user.userid
                logged_fpn = userpath + userid + "/profile.json"
                notlogged_fpn = userpath + notlogged_userid + "/profile.json"
                notlogged_notif = userpath + notlogged_userid + "/notifications.json"
                if (fs.existsSync(logged_fpn)) {
                    if (fs.existsSync(notlogged_fpn)) {

                        try {
                            var loggeduser = await getJSON(logged_fpn)
                            var notloggeduser = await getJSON(notlogged_fpn)
                        } catch (error) {
                            message = `Something went wrong while getting user profiles. FOLLOW_3`
                            res.json({
                                status: `error`,
                                message
                            })
                        }

                        const index1 = notloggeduser.followers.who.indexOf(userid);
                        const index2 = loggeduser.following.who.indexOf(notlogged_userid);
                        // console.log(index1, ' and ', index2);
                        status = 0
                        if (index1 == -1) {
                            // not followed
                            notloggeduser.followers.who.unshift(userid);
                            notloggeduser.followers.c++;
                            loggeduser.following.who.unshift(notlogged_userid);
                            loggeduser.following.c++;
                            status = `followed`

                            // send notif
                            let notif = await getJSON(notlogged_notif)
                            notifObj = { nid: notif.length + 1, userid, ncode: `follow`, ntime: new Date(), read: false }
                            notif.unshift(notifObj)
                            fs.writeFile(notlogged_notif, JSON.stringify(notif), err => {
                                if (err) throw err
                            })
                        } else {
                            // already followed
                            notloggeduser.followers.who.splice(index1, 1);
                            notloggeduser.followers.c--;
                            loggeduser.following.who.splice(index2, 1);
                            loggeduser.following.c--;
                            status = `unfollowed`

                            // delete follow
                            let notif = await getJSON(notlogged_notif)
                            var index = -1;
                            var filteredObj = notif.find(function(item, i) {
                                if (item.userid === userid && item.ncode == `follow`) { index = i; return i; }
                            });
                            notif.splice(index, 1)
                            fs.writeFile(notlogged_notif, JSON.stringify(notif), err => {
                                if (err) throw err
                            })
                        }

                        fs.writeFile(notlogged_fpn, JSON.stringify(notloggeduser), err => {
                            if (err) throw err;
                            fs.writeFile(logged_fpn, JSON.stringify(loggeduser), err => {
                                if (err) throw err;
                                res.json({ status })
                            })
                        })
                    } else {
                        res.json({
                            status: `error`,
                            message: 'Something went wrong while following. FOLLOW_2'
                        })
                    }
                } else {
                    res.json({
                        status: `error`,
                        message: 'Something went wrong while following. FOLLOW_1'
                    })
                }
            } else {
                res.json({
                    status: `info`,
                    message: 'The user named ' + req.params.username + ' is not exist.'
                })
            }

        } else {
            res.json({
                status: 0
            })
        }
    })

app.route('/delete/:postid')
    .get((req, res) => {
        res.end('/delete wrong method')
    })
    .post((req, res) => {
        if (req.session.userid) {
            Post.findOne({ postid: req.params.postid })
                .then(result => {
                    if (result) {
                        if (result.userid === req.session.userid) {
                            Post.deleteOne({ postid: req.params.postid })
                                .then(mresult => {
                                    if (result) {
                                        fullpathname = postpath + req.params.postid + '.json'
                                        fs.unlink(fullpathname, err => {
                                            if (err) throw err
                                            res.json({ status: 1 })
                                        })
                                    } else {
                                        res.json({ status: 2 })
                                    }
                                })
                        } else {
                            res.json({ status: 2 })
                        }
                    } else {
                        res.json({ status: 2 })
                    }
                })
        } else {
            res.json({ status: 0 })
        }
    })

app.route('/:postid/report')
    .get((req, res) => {
        res.end('NOT_ALLOWED_METHOD')
    })
    .post(async(req, res) => {
        if (req.session.userid) {
            userid = req.session.userid
            if (req.params.postid) {
                postid = req.params.postid
                reportnumber = req.body.reportnumber
                reporttext = req.body.reporttext.trim()
                reportlimit = 3

                let post = await Post.findOne({ userid, postid }) // if the owner and the reporting person are the same
                if (!post) {
                    var start = new Date();
                    start.setHours(0, 0, 0, 0);
                    var end = new Date();
                    end.setHours(23, 59, 59, 999);
                    // find logged user's reports on today, if > reportlimit send msg: 'You report much post today'
                    let reports = await Report.find({ userid, createdAt: { $gte: start, $lt: end } })
                    if (reports.length === reportlimit) {
                        res.json({ status: 2, message: 'You have exceeded your reporting limit. Try again tomorrow.' })
                    } else { // if not exeedeed reportlimit

                        let reportcount = await Count.findOneAndUpdate({}, { $inc: { reports: 1 } });
                        console.log('repoererewr =>', reportcount);
                        let report = await new Report({
                            reportid: (reportcount.reports ? reportcount.reports : countObj.reports),
                            userid,
                            postid,
                            reportnumber,
                            reporttext: escape(reporttext),
                            reportlang: 'tr',
                            status: 0
                        }).save()
                        if (report) {
                            console.log('report.reportid =>', report.reportid);
                            res.json({ status: 1, reportid: report.reportid })
                        } else {
                            res.json({ status: 2, message: 'Something went wrong. Please try again later.' })
                        }
                    }
                } else {
                    res.json({ status: 2, message: 'You can not report your post.' })
                }
            } else {
                res.json({ status: 2, message: 'Wrong post number.' })
            }
        } else {
            res.json({ status: 0 })
        }
    })

app.route('/post/:postid')
    .get(async(req, res) => {
        try {
            u1 = req.session.username;
            postid = req.params.postid;
            var ncount = 0;
            let status = 0;
            let postfile;
            let message = '';
            var userid;
            if (req.session.userid) { // if it is not visitor. logged in
                userid = req.session.userid;
                notifpath = userpath + userid + '/notifications.json';
                let notifs = await getJSON(notifpath)
                if (notifs.length > 0) {
                    notifs.forEach((notif, i) => {
                        if (!notif.read) ncount++;
                    })
                }
            }
            let post = await Post.findOne({ postid });
            if (post) {
                postfilepath = postpath + postid + '.json';
                if (fs.existsSync(postfilepath)) {
                    postfile = await getJSON(postfilepath);
                } else {
                    status = 2;
                    message = messages[404];
                }
                let user = await User.findOne({ userid: post.userid })
                if (user) {
                    res.render('post', {
                        status,
                        message,
                        ncount,
                        u1,
                        result: {
                            postid: post.postid,
                            userid: post.userid,
                            username: user.username,
                            post: {
                                attacments: post.attacments,
                                article: post.article,
                                counts: [postfile.likes.c, postfile.dislikes.c, postfile.comments.c],
                                createdAt: post.createdAt,
                                updatedAt: post.updatedAt,
                                visibility: post.visibility,
                            },
                            is_me: (post.userid === userid),
                            is_verified_user: user.verified,
                            last_comment: null,
                            is_liked: postfile.likes.who.includes(userid),
                            is_disliked: postfile.dislikes.who.includes(userid),
                        }
                    })
                } else {
                    let message = messages[404] + 'Error code: E100';
                    res.render('post', {
                        status,
                        message,
                        ncount,
                        u1
                    })
                }
            } else {
                let message = messages[404] + 'Error code: E101';
                res.render('post', {
                    status,
                    message,
                    ncount,
                    u1
                })
            }
        } catch (error) {
            console.log('err => 1579 \n', error);
        }
    })

// ---------------------- FIRST THOUSAND LINE CODE ==========================

app.route('/save/:postid')
    .get((req, res) => {
        res.end('/save wrong method')
    })
    .post((req, res) => {
        if (!req.session.userid) {
            res.json({
                status: 0
            })
        } else {
            pathname = 'forbidden/users/'
            userid = req.session.userid
            postid = req.params.postid
            fpn = userpath + userid + "/saved.json"
            saveObj = { postid, userid, createdAt: new Date() }

            if (fs.existsSync(fpn) && fs.existsSync(pathname)) {
                fs.readFile(fpn, (err, savedata) => {
                    savedata = JSON.parse(savedata)
                    sdl = savedata.length
                    if (sdl > 0) {
                        m_var = 1
                        var index = -1;
                        var val = postid
                        var filteredObj = savedata.find(function(item, i) {
                            if (item.postid === val) { index = i; return i; }
                        });
                        if (index > -1) {
                            savedata.splice(index, 1)
                            fs.writeFile(fpn, JSON.stringify(savedata), err => {
                                if (err) res.json({ status: 3, message: String(err) })
                                res.json({ status: 2 })
                            })
                        } else {
                            fs.writeFile(fpn, JSON.stringify(savedata), err => {
                                if (err) res.json({ status: 3, message: String(err) })
                                res.json({ status: 1 })
                            })
                        }
                    } else {
                        savedata.unshift(saveObj)
                        fs.writeFile(fpn, JSON.stringify(savedata), err => {
                            if (err) res.json({ status: 3, message: String(err) })
                            res.json({ status: 1 })
                        })
                    }
                })
            } else {
                res.json({ status: 3, message: 'There is an error please try again later.' })
            }
        }
    })

app.use((req, res, next) => {
    let message = messages[404];
    res.render('404', { message })
});

app.use((err, req, res, next) => {
    console.log('ERROR 1153\n',err)
    res.status(500).end('Something broke!');
});

let port = process.env.PORT;
if (port == null || port == "") {
    port = 80;
}
app.listen(port, () => {
    console.log('Server working at http://localhost:' + port)
})

// 17.01.2021 00:00 1223
// 19.01.2021 02:59 1183
// 20.01.2021 02:16 1163
// 21.01.2021 03:16 1212 https://prnt.sc/xbovy6
// 22.01.2021 05:00 1277
// 23.01.2021 05:24 1322
// 02.02.2021 02:32 1437
// 03.02.2021 04:45 1406
// 13.04.2021 18.50 1717
// 21.08.2021 04.39 1105 https://prnt.sc/1qdjdxx :cool_cat: 