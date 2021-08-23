isclickedLogin = false
$('#loginbtn').on('click', () => {
  if (!isclickedLogin) {
    isclickedLogin = true
    url = '/admin/login'
    data = $('#loginform').serialize()
    $.post(url, data, res => {
      if (res.success == 1) {
        message = "Admin Login is Successfuly."
        popup(message, 'auto', 'success', 1000)
        setTimeout(() => {
          window.location.href = "/admin";
        }, 1000);
      }
      else if (res.error == 1) {
        message = res.message
        popup(message, 'auto', 'warning', 4000)
      }
    })
    isclickedLogin = false
  }
})