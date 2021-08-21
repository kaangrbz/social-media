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
    if (!req.session.username) {
        res.json({ status: 0 })
        return
    }

    username = req.session.username
    userid = req.session.userid
    media = null
    article = req.body.article.trim() || ''
    tags = req.body.tags.trim() || ''
    if (!article && !media) {
        res.json({ error: 1, message: 'Write something or select a picture -image not avaliable now-' })
    } else {
        postObj = {
                userid,
                likes: {
                    c: 0,
                    who: []
                },
                dislikes: {
                    c: 0,
                    who: []
                },
                comments: {
                    c: 0,
                    who: []
                }
            }
            // save to json


        var lastPost = await Post.findOne({}).sort({ createdAt: -1 });
        console.log(lastPost);
        (lastPost) ? postObj.postid = (Number(lastPost.postid) + 1): postObj.postid = countObj.posts

        fullpathname = postpath + postObj.postid + ".json"

        fs.writeFile(fullpathname, JSON.stringify(postObj), (err) => {
                if (err) throw err;
            })
            // save to db
        const post = new Post({
                userid,
                postid: postObj.postid,
                attacments: [],
                article,
                visibility: true,
                createdAt: new Date(),
                updatedAt: new Date()
            })
            .save()
            .then(result => {
                if (!result) res.json({ error: 1, message: 'There is an error while posting. Please try again later. POST_1' });
                res.json({ success: 1 })
            })
            .catch(err => {
                res.json({ error: 1, message: `There is an error while posting. Please try again later. POST_2` })
            })
    }

    return
    // upload photo with compress and crop
    upload(req, res, (err) => {
        if (err) {
            res.render('index', {
                message: err
            });
        } else {
            if (req.file == undefined) {
                res.render('index', {
                    message: 'Error: No File Selected!'
                });
            } else {
                res.render('index', {
                    message: 'File Uploaded!',
                    file: `uploads/${req.file.filename}`,
                    ext: req.file.mimetype
                });
            }
        }
    });
}