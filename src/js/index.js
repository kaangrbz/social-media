verifiedTag =
  '<span class="verified" title="Verified account"><i class="far fa-check-circle"></i></span>';
saveTag = '<img src="/img/save.svg" alt="savetag">Save';
savedTag = '<img src="/img/saved.svg" alt="unsavetag">Unsave';
///////////////////////////////// gotopbtn ////////////////////////////
//Get the button
let tag = document.querySelector("html");
var goTopBtn = document.querySelector("#gotopbtn");
// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = () => {
  scrollFunction();
};

function scrollFunction() {
  let limit = 200;
  if (tag.scrollTop > limit || document.documentElement.scrollTop > limit) {
    goTopBtn.style.visibility = "visible";
    goTopBtn.style.opacity = "1";
  } else {
    goTopBtn.style.visibility = "hidden";
    goTopBtn.style.opacity = "0";
  }
}
// When the user clicks on the button, scroll to the top of the document
function topFunction() {
  tag.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}
/* // random cool bg (optional)
function randombgcolor() {
		var x = Math.floor(Math.random() * 256);
		var y = Math.floor(Math.random() * 256);
		var z = Math.floor(Math.random() * 256);
		var bgColor = "rgb(" + x + "," + y + "," + z + ",0.8)";
		document.getElementsByTagName('body')[0].style.background = bgColor;
}
setInterval(randombgcolor,1100);
*/

$(".more").on("click", (e) => {
  more(e.currentTarget);
});

function more(e) {
  postid = $(e).parent().parent().attr("data-post-id");
  opt = $("div[data-post-id=" + postid + "] .options");
  if (opt.css("display") == "none") {
    opt.show(300);
  } else {
    opt.hide(300);
  }
}

$(".like").on("click", (e) => {
  like(e.currentTarget);
});

function like(e) {
  postid = $(e).parent().parent().attr("data-post-id");
  url = `/like/${postid}/event/`;
  $.post(url, (res) => {
    console.log("likes status => ", res.status);

    c = $(".likes" + postid)[0];
    d = $(".dislikes" + postid)[0];
    f = $("div[data-post-id=" + postid + "] .dislike");
    if (res.status === 0) {
      message = `You should login for this <a href="/login">Let's login</a>`;
      popup(message, "auto", "warning", 3000);
    } else if (res.status == `liked`) {
      c.innerHTML = Number(c.textContent) + 1;
      e.src = "/img/arrow2.svg";
    } else if (res.status == `unliked`) {
      c.innerHTML = Number(c.textContent) - 1;
      e.src = "/img/arrow.svg";
    } else if (res.status === `liked_while_disliked`) {
      c.innerHTML = Number(c.textContent) + 1;
      d.innerHTML = Number(d.textContent) - 1;
      e.src = "/img/arrow2.svg";
      f.attr("src", "/img/arrow.svg");
    } else if (res.status == `error`) {
      message = res.message;
      popup(message, "auto", "error", 3000);
    }
  });
}
$(".dislike").on("click", (e) => {
  dislike(e.currentTarget);
});

function dislike(e) {
  postid = $(e).parent().parent().attr("data-post-id");
  url = `/dislike/${postid}/event/`;
  $.post(url, (res) => {
    d = $(".dislikes" + postid)[0];
    c = $(".likes" + postid)[0];
    f = $("div[data-post-id=" + postid + "] .like");
    if (res.status === 0) {
      message = `You should login for this <a href="/login">Let's login</a>`;
      popup(message, "auto", "warning", 3000);
    } else if (res.status === `disliked`) {
      d.innerHTML = Number(d.textContent) + 1;
      e.src = "/img/arrow2.svg";
    } else if (res.status === `undisliked`) {
      d.innerHTML = Number(d.textContent) - 1;
      e.src = "/img/arrow.svg";
    } else if (res.status === `disliked_while_liked`) {
      d.innerHTML = Number(d.textContent) + 1;
      c.innerHTML = Number(c.textContent) - 1;
      e.src = "/img/arrow2.svg";
      f.attr("src", "/img/arrow.svg");
    } else if (res.status == `error`) {
      message = res.message;
      popup(message, "auto", "error", 3000);
    }
  });
}

$(".send").on("click", (e) => {
  send(e.currentTarget);
});

function send(e) {
  postid = $(e).parent().parent().parent().attr("data-post-id");
  message = $("div[data-post-id=" + postid + "] input[type=text]").val() || "";
  url = `/comment/${postid}/event/`;
  c = $("div[data-post-id=" + postid + "] .comments");
  if (message.length > 0) {
    data = { message };
    commentcount = $("div[data-post-id=" + postid + "] .c");
    $.post(url, data, (res) => {
      input = $("div[data-post-id=" + postid + "] input[type=text]");
      if (res.status === 0) {
        message = `You should login for this <a href="/login">Let's login</a>`;
        popup(message, "auto", "warning", 3000);
      } else if (res.success === 1) {
        let outputUsername = res.username;
        if (res.isverified) outputUsername = res.username + verifiedTag;
        comment =
          '<div class="comment"><span class="uname"><a href="/' +
          res.username +
          '">' +
          outputUsername +
          '</a></span><span class="cmsg">' +
          res.message +
          '</span><span class="cdate">' +
          res.date +
          "</span></div>";
        $(commentcount).html(Number($(commentcount).text()) + 1);
        c.append(comment);
        input.val("");
      } else if (res.error === 1) {
        message = res.message;
        popup(message, "auto", "warning", 3000);
      } else {
        console.log("else");
      }
    });
  } else {
  }
}

$.urlParam = function (name) {
  var results = new RegExp("[?&]" + name + "=([^&#]*)").exec(
    window.location.href
  );
  if (results == null) {
    return null;
  }
  return decodeURI(results[1]) || 0;
};
if ($.urlParam("status") == "ok") {
  Swal.fire({
    icon: "success",
    title: "Success!",
    text: "Updated successfuly.",
  });
}

$(".follow").on("click", (e) => {
  follow(e.currentTarget);
});

function follow(e) {
  username = $(e).data("username");
  f1 = document.querySelector(".pfollowers");
  f2 = document.querySelector(".pfollowings");
  url = `/${username}/follow/`;
  console.log("follow url => ", url);
  $.post(url, (res) => {
    console.log("follow res: ", res);
    if (res.status === 0) {
      message = `You should login for this <a href="/login">Let's login</a>`;
      popup(message, "auto", "warning", 3000);
    } else if (res.status === `followed`) {
      $(".follow").html("Unfollow");
      f1.innerHTML = Number(f1.textContent) + 1;
    } else if (res.status === `unfollowed`) {
      f1.innerHTML = Number(f1.textContent) - 1;
      $(".follow").html("Follow");
    } else if (res.status === `error`) {
      Swal.fire({ icon: "error", title: "Oops...", text: res.message });
    }
  });
}

$(".del").on("click", (e) => {
  del(e.currentTarget);
});

function del(e) {
  val = $(e).parent().parent().parent().parent().attr("data-post-id");
  url = "/delete/" + val;
  $.post(url, (res) => {
    if (res.status === 0) {
      message = `Some errors while delete`;
      popup(message, "popup", "danger");
    } else if (res.status === 1) {
      $("div[data-post-id=" + val + "]")
        .removeAttr("data-post-id")
        .remove();
      message = `Post deleted successfuly`;
      popup(message, "auto", "success", 5000);
    } else if (res.status === 2) {
      message = `Unauthorized process!`;
      popup(message, "popup", "danger");
    }
  });
}

$(".save").on("click", (e) => {
  save(e.currentTarget);
});

function save(e) {
  val = $(e).parent().parent().parent().parent().attr("data-post-id");
  url = "/save/" + val;
  $.post(url, (res) => {
    console.log("save status: ", res);
    if (res.status === 0) {
      message = `You should login for this <a href="/login">Let's login</a>`;
      popup(message, "auto", "warning", 3000);
    } else if (res.status === 1) {
      $(e).html(savedTag);
    } else if (res.status === 2) {
      $(e).html(saveTag);
    } else if (res.status === 3) {
      message = res.message;
      popup(message, "auto", "danger", 3000);
    } else {
      message = `I dont't know but something happened`;
      popup(message, "auto", "danger", 3000);
    }
  });
}

$("#textarea").on("keyup", function () {
  $("#count").text("Characters left: " + (500 - $(this).val().length));
});

$("#update").on("click", (e) => {
  update(e.currentTarget);
});

function update(e) {
  $.post("/edit/", $("#updateform").serialize(), (res) => {
    $(e).attr("disabled", "disabled");
    $(".msg").empty();
    i = $("input[type=text][name=username]");
    adiv = $("div.alts").empty();
    var y = $(window).scrollTop();
    if (res.status === 0) {
      message = `You should login for this <a href="/login">Let's login</a>`;
      popup(message, "auto", "warning", 3000);
    } else if (res.success === 1) {
      try {
        var tag_username = document.getElementsByClassName(`username`);
        var tag_fullname = document.getElementsByClassName(`fullname`);
        var tag_biography = document.getElementsByClassName(`biography`);
      } catch (error) {}

      res.username ? (tag_username.textContent = res.username) : null;
      res.fullname ? (tag_fullname.textContent = res.fullname) : null;
      res.biography ? (tag_biography.textContent = res.biography) : null;
      message = res.message;
      popup(message, "auto", "success", 3000);
      let counter = 5;
      let interval = setInterval(function () {
        counter--;
        $(e).html("Update in (" + counter + "s)");
        if (counter == 0) {
          $(e).removeAttr("disabled");
          $(e).html("Update");
          clearInterval(interval);
        }
      }, 1000);
    } else if (res.error === 1) {
      message = res.message;
      popup(message, "auto", "danger", 4500);
      let counter = 5;
      let interval = setInterval(function () {
        counter--;
        $(e).html("Update in (" + counter + "s)");
        if (counter == 0) {
          $(e).removeAttr("disabled");
          $(e).html("Update");
          clearInterval(interval);
        }
      }, 1000);
      if (res.alternatives.length > 0) {
        let alts = res.alternatives;
        f = true;
        message = res.message;
        popup(message, "auto", "danger", 4500);

        let counter = 5;
        let interval = setInterval(function () {
          counter--;
          $(e).html("Update in (" + counter + "s)");
          if (counter == 0) {
            $(e).removeAttr("disabled");
            $(e).html("Update");
            clearInterval(interval);
          }
        }, 1000);
        alts.forEach((alt) => {
          if (alt !== null) {
            if (f) {
              f = false;
              adiv.append("Some alternatives: ");
            }
            a = '<span class="alt">' + alt + "</span>";
            adiv.append(a);
          }
        });
        $(".alt").on("click", (e) => {
          i.val(e.currentTarget.textContent); // i => input
        });
        $(e).removeAttr("disabled");
      }
    } else if (res.error === 1) {
    }
  });
}

$("#postbtn").on("click", (e) => {
  $(".slideToCart").css("transform", "translate(50px, 50px)");
  addpost(e.currentTarget);
});

function addpost(e) {
  $.post("/post/", $("#postform").serialize(), (res) => {
    $(e).attr("disabled", "disabled");
    $(".msg").empty().hide();
    var y = $(window).scrollTop();

    var counter = 5;
    console.log("post res => ", res);
    if (res.status === 0) {
      message = `You should login for this <a href="/login">Let's login</a>`;
      popup(message, "auto", "warning", 3000);
    } else if (res.success == 1) {
      message = `Successfuly added post.`;
      popup(message, "auto", "success", 3000);
      var interval = setInterval(function () {
        $(e).html("Post again in (" + counter + "sec)");
        if (counter == 0) {
          $(e).removeAttr("disabled");
          $(e).html("Post");
          clearInterval(interval);
        }
        counter--;
      }, 1000);
    } else if (res.error === 1) {
      message = res.message;
      popup(message, "auto", "danger", 3000);
      var interval = setInterval(function () {
        $(e).html("Post in (" + counter + "s)");
        if (counter == 0) {
          $(e).removeAttr("disabled");
          $(e).html("Post");
          clearInterval(interval);
        }
        counter--;
      }, 1000);
    } else {
    }
  });
}

$(".report").on("click", (e) => {
  console.log("reports are soon");
  // report(e.currentTarget)
});

function report(e) {
  postid = $(e).parent().parent().parent().parent().attr("data-post-id");
  url = "/" + postid + "/report/";
  isrepoted = true;
  if (isrepoted) {
    isrepoted = false;
    $.post(url, (res) => {
      if (res.status === 0) {
        message = `You should login for this <a href="/login">Let's login</a>`;
        popup(message, "auto", "warning", 3000);
      } else if (res.status === 1) {
        message = `Successfuly reported.`;
        popup(message, "auto", "success", 3000);
        isrepoted = false;
      } else if (res.status === 2) {
        message = "You are already reported.";
        popup(message, "auto", "warning", 3000);
        isrepoted = false;
      } else if (res.status === 3) {
        message = "There is an error. Please try again later";
        popup(message, "auto", "danger", 3000);
      }
    });
  }
}

var xhr = "";

var timeout;

function getNotif() {
  var res;
  var xhr = $.ajax({
    type: "POST",
    url,
    success: (res) => {
      n_loading.hide();
      $(".markasread").show();
      console.log(res);
      // // return
      if (res.status === 0) {
        message = `You should login for this <a href="/login">Let's login</a>`;
        popup(message, "auto", "warning", 3000);
      } else if (res.status === 1 || res.status == 2) {
        notifs = res.result;
        if (notifs.length > 0) {
          var limit = 12;
          try {
            notifs.forEach((notif, index) => {
              username = notif.username;
              username =
                username.length > limit
                  ? username.substring(0, limit) + ".."
                  : username;
              switch (notif.ncode) {
                case `like`:
                  t = `<li class="${
                    !notif.read ? `notread` : ``
                  }"><a title="${username} liked your post." href="/post/${
                    notif.postid
                  }"><i class="fas fa-heart"></i><b>${username}</b>liked your post. </a><span class="ntime">${
                    notif.ntime
                  }</span></li>`;
                  ntag.append(t);
                  break;
                case `follow`:
                  t = `<li class="${
                    !notif.read ? `notread` : ``
                  }"><a title="Go to ${username}\'s profile" href="/${username}"><i class="fas fa-user-plus"></i><b>${username}</b>started to follow you</a><span title="" class="ntime">${
                    notif.ntime
                  }</span></li>`;
                  ntag.append(t);
                  break;
                case `comment`:
                  t = `<li class="${
                    !notif.read ? `notread` : ``
                  }"><a title="${username} commented to your post." href="/post/${
                    notif.postid
                  }"><i class="fas fa-comment"></i><b>${username}</b> commented: <span class="commenttext">${
                    notif.commenttext
                  }</span></a><span class="ntime">${notif.ntime}</span></li>`;
                  ntag.append(t);
                  break;
              }
            });
          } catch (error) {
            t = `<li><a href="" onclick="location.reload()">There is an error please refresh the page</a><br>err: ${error}</li>`;
            ntag.append(t);
          }
        } else {
          t = `<li><a href="javascript:void(0)">You have no notification, yet..<i class="far fa-sad-tear"></i></a></li>`;
          ntag.append(t);
        }
      } else if (res.status === 3) {
        n_loading.hide();
        message =
          res.message +
          ' Please <a href="javascript:void(0)" onclick="location.reload()">refresh the page.</a>';
        popup(message, "popup", "danger");
      }
    },
    error: (e) => {
      console.log(e);
    },
  });
}

function runFunc() {
  var delay = 100;
  $(".markasread").hide();
  timeout = setTimeout(getNotif, delay);
}

function clearFunc() {
  clearTimeout(timeout);
}
let is_clicked_notif = false;
$(".notif").on("click", (e) => {
  url = "/notif/";
  n_loading = $(".notifloading");
  ntag = $(".notifications ul");
  $(".notifications").toggleClass("active");

  if (!is_clicked_notif) {
    $(".notifications ul").empty();
    is_clicked_notif = true;
    $(".notifloading").show(10);

    runFunc();
  } else {
    is_clicked_notif = false;
    clearFunc();
  }

  $(".ncount").hide(100);
});

markasread = true;
$(".markasread").on("click", () => {
  if (markasread) {
    url = "/markasread";
    $.post(url, (res) => {
      console.log("markasread res =>", res);
      if (res.status === 0) {
        message = `You should login for this <a href="/login">Let's login</a>`;
        popup(message, "auto", "warning", 3000);
      } else if (res.status === 1) {
        message = `Successfuly marked as read.`;
        popup(message, "auto", "success", 3000);
      } else if (res.status === 2) {
        message = res.message;
        popup(message, "auto", "danger", 3000);
      }
    });
  }
});

$("#search").on("keypress", (e) => {
  console.log(e);
  if (e.keyCode === 13) {
    search($("#search").val());
  }
});

$(".searchbtn").on("click", (e) => {
  search($("#search").val());
});

issearched = false;

function search(string) {
  if (!issearched) {
    console.log(string);
    url = "/search";
    data = {
      searchData: $("#search").val().trim().toLowerCase(),
    };
    $.post(url, data, (res) => {
      console.log(res);
      if (res) {
        issearched = true;
      }
    });
  }
}
// function stopSearch(searchTimeout) {
//   console.log('stopped');
//   clearTimeout(searchTimeout)
// }
function copyToClipboard(element) {
  var $temp = $("<input>");
  $("body").append($temp);
  $temp.val($(element).text()).select();
  document.execCommand("copy");
  $temp.remove();
}
$(".copy-btn").on("click", () => {
  copyToClipboard(".link");
  message = `Successfully copied to clipboard.`;
  popup(message, "auto", "success", 3000);
});

$(".share").on("click", () => {
  $(".share-div").addClass("share-active");
});
$(".share-close", ".share-div").on("click", () => {
  $(".share-div").removeClass("share-active");
});

$(".report").on("click", () => {
  $(".report-div").addClass("report-active");
});

report_click = false;
$(".report-btn").on("click", (e) => {
  if (!report_click) {
    report_click = true;
    tag = e.currentTarget;
    reportnumber = $(tag).attr("data-report-number");
    reporttext = $(tag).text();
    postid = $(".report-div .postid").text();

    url = "/" + postid + "/report";
    data = {
      reportnumber,
      reporttext,
    };
    $.post(url, data, (res) => {
      console.log("report res =>", res);
      if (res.status === 0) {
        message = `You should login for this <a href="/login">Let's login</a>`;
        popup(message, "auto", "warning", 3000);
      } else if (res.status === 1) {
        message = `Successfuly reported. Your reportid: ` + res.reportid;
        popup(message, "popup", "info");
      } else if (res.status === 2) {
        message = res.message;
        popup(message, "auto", "danger", 3000);
      }
      report_click = false;
    });
  }
});

$(".report-close", ".report-div").on("click", () => {
  $(".report-div").removeClass("report-active");
});

function setCookie(c_name, value, exdays) {
  var exdate = new Date();
  exdate.setDate(exdate.getDate() + exdays);
  var c_value =
    escape(value) + (exdays == null ? "" : "; expires=" + exdate.toUTCString());
  document.cookie = c_name + "=" + c_value;
}

function getCookie(c_name) {
  var i,
    x,
    y,
    ARRcookies = document.cookie.split(";");
  for (i = 0; i < ARRcookies.length; i++) {
    x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
    y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
    x = x.replace(/^\s+|\s+$/g, "");
    if (x == c_name) {
      return unescape(y);
    }
  }
}
if (!getCookie("cookieStatus")) {
  $(".cookie").addClass("cookie-active");
}
$(".cookie-btn").on("click", () => {
  setCookie("cookieStatus", true, 99999);
  $(".cookie").removeClass("cookie-active");
});
