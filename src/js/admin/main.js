function download(fileUrl, fileName) {
  var a = document.createElement("a");
  a.href = fileUrl;
  a.setAttribute("download", fileName);
  a.click();
}

isclickedDownload = false;

document.querySelector("#maintenance").addEventListener("click", (e) => {
  console.log(e.target.checked);
  return;
  if (!isclickedDownload) {
    isclickedDownload = true;
    url = "/admin/backup";
    $.post(url, (res) => {
      if (res.success == 1) {
        message = "Download backup is successfuly.";
        popup(message, "auto", "success", 1000);
      } else if (res.error == 1) {
        message = res.message;
        popup(message, "auto", "warning", 4000);
      }
    });
    isclickedDownload = false;
  }
});
