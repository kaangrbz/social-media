var { User, Post } = require("../models/blogs");
const fs = require("fs");
var timeago = require("timeago.js");
var tr_TR = function (number, index, totalSec) {
  return [
    ["şimdi", "az önce"],
    ["%s saniye önce", "%s saniye içinde"],
    ["1 dakika önce", "1 dakika içinde"],
    ["%s dakika önce", "%s dakika içinde"],
    ["1 saat önce", "1 saat içinde"],
    ["%s saat önce", "%s saat içinde"],
    ["1 gün önce", "1 gün içinde"],
    ["%s gün önce", "%s gün içinde"],
    ["1 hafta önce", "1 hafta içinde"],
    ["%s hafta önce", "%s hafta içinde"],
    ["1 ay önce", "1 ay içinde"],
    ["%s ay önce", "%s ay içinde"],
    ["1 yıl önce", "1 yıl içinde"],
    ["%s yıl önce", "%s yıl içinde"],
  ][index];
};
timeago.register("tr_TR", tr_TR);

function validateEmail(email) {
  const re =
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

function validateDate(date) {
  if (date) {
    date = new Date(date);
    var day = date.getDate();
    var month = date.getMonth();
    var year = date.getFullYear();
    var age = 15;
    var mydate = new Date();
    if (date.getFullYear() <= mydate.getFullYear() - 18) {
      if (date.getMonth() <= mydate.getMonth()) {
        if (date.getDate() <= mydate.getDate()) {
          return true;
        }
      }
    }
    return false;
  } else {
    return false;
  }
}

function formatDate(date, mode) {
  mdate = date;
  hour = date.getHours();
  minute = date.getMinutes();
  if (hour < 10) hour = "0" + mdate.getHours();
  if (minute < 10) minute = "0" + mdate.getMinutes();
  normaldate =
    date.getDate() + "." + date.getMonth() + "." + date.getFullYear();
  fulldate =
    date.getDate() +
    "." +
    date.getMonth() +
    "." +
    date.getFullYear() +
    " • " +
    hour +
    ":" +
    minute;
  formatted = timeago.format(date, "tr_TR");
  try {
    if (mode == "timeago") {
      return formatted;
    } else if (mode == "date") {
      return normaldate;
    } else if (mode == "fulldate") {
      return fulldate;
    } else {
      return "";
    }
  } catch (error) {
    console.log("formatDate catch error");
    console.log(error);
    return false;
  }
}

function checkAuthority(number) {
  mnumber = Number(number);
  if (!isNaN(mnumber)) {
    if (number === 100) {
      return true;
    } else {
      return false;
    }
  }
  return false;
}

function isForbiddenUsername(username) {
  if (username) {
    forbiddenUsernames = [
      "ataturk",
      "explore",
      "allah",
      "hzmuhammed",
      "kuranikerim",
      "index",
      "ismetinonu",
      "sekiz",
      "sekizdestek",
      "sekizbilgi",
      "sekizresim",
      "sekizmuzik",
    ];
    if (forbiddenUsernames.includes(username)) return true;
    else return false;
  } else {
    return "";
  }
}

function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

async function createAlternativeUsername(username, count) {
  var bool = true;
  var alternatives = [];
  let c = 0;
  while (bool) {
    var min = 10;
    var max = 100;
    var alt;
    const prefixs = [`lol`, `skz`, `md`, `lol`, `sha`];
    let randomNum = Math.floor(Math.random() * prefixs.length);
    var randomPrefix = prefixs[randomNum];
    let regex = /[^a-zA-Z0-9_]+/g;
    regex = /[^0-9_]+/g;
    r = Math.random().toString(36).replace(regex, "").substr(0, 3);
    alt = `${randomPrefix}_${username}${r}`;
    a = await User.findOne({ username: alt });
    if (!a) {
      c++;
      alternatives.push(alt);
    }
    if (c == count) {
      bool = false;
      return alternatives;
    }
  }
}

async function createFolders() {
  pathname = "forbidden/";
  var postFolder = fs.existsSync(pathname);
  if (!postFolder) {
    // posts folder is not exist and will create
    fs.mkdir(pathname, (err) => {
      if (err) console.log("create folder error1");
    });
  }
  pathname = "forbidden/posts/";
  var postFolder = fs.existsSync(pathname);
  if (!postFolder) {
    // posts folder is not exist and will create
    fs.mkdir(pathname, (err) => {
      if (err) console.log("create folder error2");
    });
  }
  pathname = "forbidden/users/";
  if (!fs.existsSync(pathname)) {
    fs.mkdir(pathname, (err) => {
      if (err) console.log("create folder error3");
    });
  }
}
module.exports = {
  validateEmail,
  formatDate,
  checkAuthority,
  validateDate,
  isForbiddenUsername,
  shuffle,
  createAlternativeUsername,
  createFolders,
};
