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

const user = getLocalStorageWithExpiry('user');

$(document).ready(function () {

    $('#user-studentId-placeholder').html(user.studentId);

    var petitionID = sessionStorage.getItem('cardId');
    console.log(petitionID);

    fetch('http://localhost:1337/petition/retrieve/single', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + user.token,
        },
        body: JSON.stringify({
            petitionId: petitionID,
        }),
    }).then(function (response) {
        if (response.status !== 200) {
            console.log('Looks like there was a problem. Status Code: ' + response.status);
            return;
        }
        response.text().then(txt => {
            console.log('in');
            let json_obj = JSON.parse(txt);
            if (json_obj) {
                // createAndAppendPetitions(json_obj);
                showPetitionCard(json_obj);
            }
            // else {
            //     $("#no-post-alert").removeClass("d-none");
            // }
        })
    }
    ).catch(function (err) {
        console.log('Fetch Error :-S', err);
    });

    $("#sign-petition").on('click', function (e) {
        e.preventDefault();

        fetch('http://localhost:1337/petition/sign', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + user.token,
            },
            body: JSON.stringify({
                petitionId: petitionID,
                // dueDate: TODO
            }),
        })
            .then(
                function (response) {
                    if (response.status !== 201) {
                        if (response.status == 403) {
                            // document.getElementById("sign-petition").disabled = true;
                            $('#sign-petition').prop('disabled', true);
                            showNotifAlert('زمان این دادخواست به پایان رسیده است!');
                            response.text().then(txt => {
                                let json_obj = JSON.parse(txt);
                                if (json_obj) {
                                    console.log(json_obj.message);
                                }
                            })
                        }
                        else if (response.status == 401) {
                            showNotifAlert('شما قبلا این دادخواست را امضا کرده‌اید!');
                        }
                        else {
                            console.log('Looks like there was a problem. Status Code: ' + response.status);
                        }
                        return;
                    }
                    window.location.reload();
                    // TODO Successful
                }
            )
            .catch(function (err) {
                console.log('Fetch Error :-S', err);
            });
    });
})

function showPetitionCard(petition) {

    array_json = petition["petition"];
    console.log(array_json);

    $petition = $("#main-container");

    $petition.find("#petition-title").text(array_json.title);
    $petition.find("#petition-txt").text(array_json.content);
    $petition.find("#petition-creator").text(array_json.createdBy);
    $petition.find("#petition-category").text(array_json.category);
    $petition.find("#petition-start-date").text(formatDate(array_json.createdAt));
    $petition.find("#petition-end-date").text(formatDate(array_json.dueDate));
    $petition.find("#petition-signers").text(array_json.signatureNum);
}

showNotifAlert = (message, style = 'danger') => {
    $('#alert-zone').html(`
        <div id="login-alert" class="alert alert-${style} alert-dismissible fade show mx-auto" style="display:block;" role="alert">
            <button id="dismiss-alert" type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
            ${message}
        </div>
    `);

    //$('#login-alert').slideDown("fast");
}

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}

// new petition -> new post
// sign petition -> 
