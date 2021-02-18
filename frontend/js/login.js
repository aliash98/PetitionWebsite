function setLocalStorageWithExpiry(key, value, ttl) {
    const now = new Date()

    // `item` is an object which contains the original value
    // as well as the time when it's supposed to expire
    const item = {
        value: value,
        expiry: now.getTime() + ttl,
    }
    window.localStorage.setItem(key, JSON.stringify(item))
}

transitionToPage = function (href) {
    document.querySelector('body').style.opacity = 0
    setTimeout(function () {
        window.location.href = href
    }, 500)
}

// document.addEventListener('DOMContentLoaded', function (event) {
//     setTimeout(function () {
//         document.querySelector('body').style.opacity = 1
//     }, 0)
// })

showLoginAlert = (message, style = 'danger') => {
    $('#alert-zone').html(`
        <div id="login-alert" class="alert alert-${style} alert-dismissible fade show mx-auto" style="display:none;" role="alert">
            <button id="dismiss-alert" type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
            ${message}
        </div>
    `);

    $('#login-alert').slideDown("fast");
}

login = () => {
    const studentIdReg = /^\d{8}$/;
    let studentId = $('#login-studentId-input').val();
    let password = $('#login-password-input').val();

    // const emailReg = "96109606";  // Regex o radif kon
    // let studentId = "96109606";
    // let password = "alialiali";


    if (studentId == '') {
        showLoginAlert('لطفا شماره دانشجویی خود را وارد کنید!')
        return;
    }

    if (!studentIdReg.test(studentId)) {
        showLoginAlert('لطفا یک شماره دانشجویی متعبر وارد کنید!')
        return;
    }

    if (password == '') {
        showLoginAlert('لطفا رمز عبور خود را وارد کنید!')
        return;
    }

    $('#dismiss-alert').click();


    fetch('http://localhost:1337/signin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "studentID": studentId,
            "password": password
        }),
    }).then(
        function (response) {
            if (response.status !== 200) {
                console.log('Looks like there was a problem. Status Code: ' + response.status);
                return;
            }
            response.text().then(txt => {
                token = JSON.parse(txt)['accessToken'];
                setLocalStorageWithExpiry('user', {
                    token: token,
                    studentId: studentId,
                    //email: email
                }, 3600000);
                showLoginAlert('ورود با موفقیت انجام شد.', 'success');
                transitionToPage('index.html');
            });
        })
        .catch(function (err) {
            console.log('Fetch Error :-S', err);
        });
}

register = () => {
    const emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
    const studentIdReg = /^\d{8}$/;

    let email = $('#register-email-input').val();
    let studentId = $('#register-studentId-input').val();
    let password = $('#register-password-input').val();
    let repeatPassword = $('#register-repeat-password-input').val();
    let acceptRules = $('#register-accept-rules').prop('checked');

    if (email == '') {
        showLoginAlert('لطفا ایمیل خود را وارد کنید!')
        return;
    }

    if (!emailReg.test(email)) {
        showLoginAlert('لطفا یک ایمیل معتبر وارد کنید!')
        return;
    }

    if (studentId == '') {
        showLoginAlert('لطفا شماره دانشجویی خود را وارد کنید!')
        return;
    }

    if (!studentIdReg.test(studentId)) {
        showLoginAlert('لطفا یک شماره دانشجویی متعبر وارد کنید!')
        return;
    }

    if (password == '') {
        showLoginAlert('لطفا رمز عبور خود را وارد کنید!')
        return;
    }

    if (password != repeatPassword) {
        showLoginAlert('رمز عبور و تکرار آن مطابقت ندارند!')
        return;
    }

    if (!acceptRules) {
        showLoginAlert('برای عضویت، قوانین و شرایط را بپذیرید!')
        return;
    }

    fetch('http://localhost:1337/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "email": email,
            "studentID": studentId,
            "password": password
        }),
    })
        .then(
            function (response) {
                if (response.status !== 201) {
                    console.log('Looks like there was a problem. Status Code: ' + response.status);
                    showLoginAlert('ایمیل یا شماره دانشجویی شما قبلا ثبت شده است!');
                    return;
                }
                response.text().then(txt =>
                    console.log(txt));
                registerDone();
            }
        )
        .catch(function (err) {
            console.log('Fetch Error :-S', err);
        });

}

// registerDone = (response) => {
//     $('#login-tab-btn').click()
//     showLoginAlert(response.message, 'success')
//     $('#dismiss-alert').click();
// }

registerDone = () => {
    $('#login-tab-btn').click()
    showLoginAlert('ثبت نام با موفقیت انجام شد.', 'success');
}

logout = () => {
    token = ''
    window.localStorage.removeItem('user')
    // showLoggedOutButtons()
}

// TODO