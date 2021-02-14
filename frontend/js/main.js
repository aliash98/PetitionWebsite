jQuery(document).ready(function ($) {
    const $sidebar = $("#sidebar");
    const $menuToggleBtn = $("#toggle-menu-btn");

    $menuToggleBtn.on('click', function () {
        $sidebar.trigger('menu:toggle');
        $menuToggleBtn.toggleClass('fa-times', 'fa-bars');
    });

    $sidebar.on('menu:toggle', function () {
        if ($menuToggleBtn.hasClass('fa-times')) {
            $sidebar.trigger('menu:close');
        } else {
            $sidebar.trigger('menu:open');
        }
    }).on('menu:open', function () {
        $sidebar.addClass('open-sidebar');
    }).on('menu:close', function () {
        $sidebar.removeClass('open-sidebar');
    });
});

// Modal
function openModal(state) {
    $(`#${state}-tab-btn`).click()
    document.getElementById('modal').classList.add('active-modal');
}
function closeModal(state) {
    document.getElementById('modal').classList.remove('active-modal');
}

showLoginAlert = message => {
    $('#alert-zone').html(`
        <div id="login-alert" class="alert alert-danger alert-dismissible fade show mx-auto" style="display:none;" role="alert">
            <button id="dismiss-alert" type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
            ${message}
        </div>
    `);

    $('#login-alert').slideDown("fast");
}

login = () => {
    const emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
    let email = $('#login-email-input').val();
    let password = $('#login-password-input').val();

    if (email == '') {
        showLoginAlert('لطفا ایمیل خود را وارد کنید!')
        return;
    }

    if (!emailReg.test(email)) {
        showLoginAlert('لطفا یک ایمیل متعبر وارد کنید!')
        return;
    }

    if (password == '') {
        showLoginAlert('لطفا رمز عبور خود را وارد کنید!')
        return;
    }

    $('#dismiss-alert').click();

    // TODO: send login request!
}

register = () => {
    const emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
    let email = $('#register-email-input').val();
    let password = $('#register-password-input').val();
    let repeatPassword = $('#register-repeat-password-input').val();
    let acceptRules = $('#register-accept-rules').prop('checked');
    
    if (email == '') {
        showLoginAlert('لطفا ایمیل خود را وارد کنید!')
        return;
    }

    if (!emailReg.test(email)) {
        showLoginAlert('لطفا یک ایمیل متعبر وارد کنید!')
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

    $('#dismiss-alert').click();

    // TODO: send register request!
}