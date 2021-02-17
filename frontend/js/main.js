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

function getLocalStorageWithExpiry(key) {
    const itemStr = window.localStorage.getItem(key)
    // if the item doesn't exist, return null
    if (!itemStr) {
        return undefined
    }
    const item = JSON.parse(itemStr)
    const now = new Date()
    // compare the expiry time of the item with the current time
    if (now.getTime() > item.expiry) {
        // If the item is expired, delete the item from storage
        // and return null
        window.localStorage.removeItem(key)
        return undefined
    }
    return item.value
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
    const emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
    let studentId = $('#login-studentId-input').val();
    let password = $('#login-password-input').val();

    // const emailReg = "96109606";  // Regex o radif kon
    // let studentId = "96109606";
    // let password = "alialiali";


    if (studentId == '') {
        showLoginAlert('لطفا شماره دانشجویی خود را وارد کنید!')
        return;
    }

    // if (!emailReg.test(studentId)) {
    //     showLoginAlert('لطفا یک شماره دانشجویی متعبر وارد کنید!')
    //     return;
    // }

    if (password == '') {
        showLoginAlert('لطفا رمز عبور خود را وارد کنید!')
        return;
    }

    // $('#dismiss-alert').click();


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
                // showLoggedInButtons();
                // closeModal();
            });
        })
        .catch(function (err) {
            console.log('Fetch Error :-S', err);
        });
}

const register = () => {
    const emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
    // let email = $('#register-email-input').val();
    // let password = $('#register-password-input').val();
    // let repeatPassword = $('#register-repeat-password-input').val();
    // let acceptRules = $('#register-accept-rules').prop('checked');
    let email = "alialaee98@gmail.com";
    let password = "alialiali";
    let repeatPassword = "alialiali";
    let studentID = "96109606";

    if (email == '') {
        showLoginAlert('لطفا ایمیل خود را وارد کنید!')
        return;
    }

    if (!emailReg.test(email)) {
        showLoginAlert('لطفا یک ایمیل معتبر وارد کنید!')
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
            "studentID": studentID,
            "password": password
        }),
    })
        .then(
            function (response) {
                if (response.status !== 201) {
                    console.log('Looks like there was a problem. Status Code: ' + response.status);
                    return;
                }
                response.text().then(txt =>
                    console.log(txt));
            }
        )
        .catch(function (err) {
            console.log('Fetch Error :-S', err);
        });

}

const logout = () => {
    token = ''
    window.localStorage.removeItem('user')
    // showLoggedOutButtons()
}


function createAndAppendPosts(posts) {
    // $posts = createPostElements(posts);
    // $("#posts-container").append($posts);
    postsElements = [];

    array_json = posts["post"];
    var i;
    // if (!Array.isArray(array_json)){
    //     array_json = [];
    //     array_json.push(posts["post"]);
    // }
    for (i = 0; i < array_json.length; i++) {
        // $post = $(".clonable-post").clone(true);
        // $post.removeClass('d-none clonable-post');

        // $post.find(".post-title").text(array_json[i].title);
        // $post.find(".post-content").text(array_json[i].content);
        // $post.find(".post-author").text(array_json[i].created_by.id);
        // $post.find(".post-created-at").text(formatDate(array_json[i].created_at));
        //postsElements.push($post)

        // TODO: assign attributes to html   
    }
    // return postsElements;

}

const getPetition = () => {
    fetch('http://localhost:1337/petition/retrieve',
        { method: 'GET' }).then(
            function (response) {
                if (response.status !== 200) {
                    console.log('Looks like there was a problem. Status Code: ' + response.status);
                    return;
                }
                response.text().then(txt => {
                    let json_obj = JSON.parse(txt);
                    if (json_obj) {
                        createAndAppendPosts(json_obj);
                    } else {
                        $("#no-post-alert").removeClass("d-none");
                    }
                })
            }).catch(function (err) {
                console.log('Fetch Error :-S', err);
            });
}


const newPetition = () => {
    fetch('http://localhost:1337/petition/new', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
        },
        body: JSON.stringify({
            title: "My",  // TODO
            content: "an", //TODO
        }),
    })
        .then(
            function (response) {
                if (response.status !== 201) {
                    console.log('Looks like there was a problem. Status Code: ' + response.status);
                    return;
                }
                //window.location.reload();    
            }
        )
        .catch(function (err) {
            console.log('Fetch Error :-S', err);
        });
}

// new petition -> new post
// sign petition -> 
//