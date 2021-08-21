const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    authority: {
        type: Number,
        require: true
    },
    userid: {
        type: Number,
        require: true
    },
    username: {
        type: String,
        require: true,
        unique: true,
    },
    userpass: {
        type: String,
        require: true,
    },
    fullname: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        require: true,
    },
    biography: {
        type: String,
        default: '',
        maxlength: 1000
    },
    visibility: {
        type: Boolean,
        default: true
    },
    verified: {
        type: Boolean,
        default: false
    },
    suspend: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        required: true
    },
    updatedAt: {
        type: Date,
        required: false
    },
})

const User = mongoose.model('User', userSchema);

const postSchema = new Schema({
    userid: {
        type: Number,
        required: true,
        unique: false,
    },
    postid: {
        type: Number,
        required: true,
        unique: true,
    },
    article: {
        type: String,
        required: false,
    },
    attacments: {
        type: Array,
        required: false,
        default: []
    },
    visibility: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        required: true,
    },
    updatedAt: {
        type: Date,
        required: false,
    },
})

const Post = mongoose.model('Post', postSchema);

const utmSchema = new Schema({
    fromwhere: {
        type: String,
        require: true,
        unique: false
    },
    whoadded: {
        type: String,
        require: true
    },
    whichsite: {
        type: String,
        require: true
    },
}, {
    timestamps: true
})

const UTM = mongoose.model('utm', utmSchema);

const reportSchema = new Schema({
    reportid: {
        type: Number,
        required: true,
        unique: true,
    },
    userid: {
        type: String,
        require: true
    },
    postid: {
        type: String,
        require: true
    },
    reportnumber: {
        type: Number,
        required: true
    },
    reporttext: {
        type: String,
        required: true
    },
    reportlang: {
        type: String,
        required: false
    },
    status: {
        default: 0
        // 0 => not looked
        // 1 => accepted      -send notif to who reported-    -suspend post, or delete- 
        // 2 => not accepted  -send notif to who reported-                      
    }
}, {
    timestamps: true
})
const Report = mongoose.model('Report', reportSchema);

module.exports = {
    User,
    Post,
    UTM,
    Report
}