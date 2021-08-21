isclickedLogin = false
$('#loginbtn').on('click', () => {
  if (!isclickedLogin) {
    isclickedLogin = true
    url = '/login'
    data = $('#loginform').serialize()
    $.post(url, data, res => {
      if (res.success == 1) {
        message = "Login is successfuly."
        popup(message, 'auto', 'success', 1000)
        setTimeout(() => {
          // window.location.href = "/"+$('input[type=text][name=username]').val();
          // window.location.href = "/";
          window.location.href = "/";
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

isclickedSignup = false
$('#signupbtn').on('click', (e) => {
  e = e.currentTarget
  if (!isclickedSignup) {
    isclickedSignup = true
    url = '/signup'
    data = $('#signupform').serialize()
    // $(e).attr('disabled', 'disabled')
    input = $('input[type=text][name=username]')
    let counter = 5;
    $.post(url, data, res => {
      if (res.success === 1) {
        message = "Signup is successfuly."
        popup(message, 'auto', 'success', 1000)
        setTimeout(() => {
          window.location.href = "/login"
        }, 1000);
      }
      else if (res.error === 1) {
        $(e).addClass('disabled')
        let interval = setInterval(function () {
          $(e).html('Try again in (' + counter + 's)')
          if (counter == 0) {
            $(e).removeClass('disabled')
            $(e).removeAttr('disabled')
            $(e).html('Sign up')
            clearInterval(interval);
          }
          counter--;
        }, 1000);

        if(res.alternatives){
          let alts = res.alternatives
          f = true
          message = res.message
          popup(message, 'auto', 'warning', 4500)
          adiv = $('.alts')
          alts.forEach(alt => {
            if (alt !== null) {
              if (f) {
                f = false
                adiv.append('Some alternatives: ')
              }
              a = '<span class="alt" style="margin-right:8px">' + alt + '</span>'
              adiv.append(a)
            }
          })
          $('.alt').on('click', (ee) => {
            input.val(ee.currentTarget.textContent) // i => input 
          })
        }
        else{ // have no alternatives but there is error
          message = res.message
          popup(message, 'auto', 'warning', 3000)
        }
      }
      else {
        message = 'There is an critical error. Please tell me this error <a href="mailto:abdikaangrbz@gmail.com">at here</a>'
        popup(message, 'popup', 'danger', 3000)
      }
    })
    isclickedSignup = false
  }
})