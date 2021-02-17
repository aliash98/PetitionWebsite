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

const user = getLocalStorageWithExpiry('user');

$(document).ready(function () {

    // if (user === undefined) {
    //     window.location.href = '/'
    //     return;
    // }

    $('#user-studentId-placeholder').html(user.studentId);

    fetch('http://localhost:1337/petition/retrieve/top', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + user.token,
        },
    }).then(function (response) {
        if (response.status !== 200) {
            console.log('Looks like there was a problem. Status Code: ' + response.status);
            return;
        }
        response.text().then(txt => {
            let json_obj = JSON.parse(txt);
            if (json_obj) {
                createAndAppendSelectedPetitions(json_obj);
            }
        })
    }
    ).catch(function (err) {
        console.log('Fetch Error :-S', err);
    });

    fetch('http://localhost:1337/petition/retrieve/open', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + user.token,
        },
    }).then(function (response) {
        if (response.status !== 200) {
            console.log('Looks like there was a problem. Status Code: ' + response.status);
            return;
        }
        response.text().then(txt => {
            let json_obj = JSON.parse(txt);
            if (json_obj) {
                createAndAppendOpenPetitions(json_obj);
            }
        })
    }
    ).catch(function (err) {
        console.log('Fetch Error :-S', err);
    });

    fetch('http://localhost:1337/petition/retrieve/closed', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + user.token,
        },
    }).then(function (response) {
        if (response.status !== 200) {
            console.log('Looks like there was a problem. Status Code: ' + response.status);
            return;
        }
        response.text().then(txt => {
            let json_obj = JSON.parse(txt);
            if (json_obj) {
                createAndAppendClosedPetitions(json_obj);
            }
        })
    }
    ).catch(function (err) {
        console.log('Fetch Error :-S', err);
    });

    $('#post-form').on('submit', function (e) {
        e.preventDefault();

        fetch('http://localhost:1337/petition/new', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + user.token,
            },
            body: JSON.stringify({
                title: $("#petitionTitle").val(),  // TODO
                content: $("#petitionText").val(), //TODO
                category: $("#petitionCategory").val(),
                // dueDate: TODO
            }),
        })
            .then(
                function (response) {
                    if (response.status !== 201) {
                        console.log('Looks like there was a problem. Status Code: ' + response.status);
                        return;
                    }
                    window.location.reload();
                }
            )
            .catch(function (err) {
                console.log('Fetch Error :-S', err);
            });
    });

    $(".selected-p").on('click', function (e) {

        $clickedCard = $(this).closest(".selected-p");
        id = $clickedCard.find("#selected-card-id").text();
        console.log($clickedCard.find("#selected-card-title").text());
        sessionStorage.setItem("cardId", id);
        window.sessionStorage.setItem("cardId", id);
        transitionToPage('sign.html');
    });

    $(".open-p").on('click', function (e) {

        $clickedCard = $(this).closest(".open-p");
        id = $clickedCard.find("#open-card-id").text();
        console.log($clickedCard.find("#open-card-title").text());
        sessionStorage.setItem("cardId", id);
        window.sessionStorage.setItem("cardId", id);
        transitionToPage('sign.html');
    });

    $(".closed-p").on('click', function (e) {

        $clickedCard = $(this).closest(".closed-p");
        id = $clickedCard.find("#closed-card-id").text();
        console.log($clickedCard.find("#closed-card-title").text());
        sessionStorage.setItem("cardId", id);
        window.sessionStorage.setItem("cardId", id);
        transitionToPage('sign.html');
    });
})

function createAndAppendSelectedPetitions(petitions) {
    $petitions = createSelectedPetitionElements(petitions);
    $("#selected-petitions-cards").append($petitions);
}

function createAndAppendOpenPetitions(petitions) {
    $petitions = createOpenPetitionElements(petitions);
    $("#open-petitions-cards").append($petitions);
}

function createAndAppendClosedPetitions(petitions) {
    $petitions = createClosedPetitionElements(petitions);
    $("#closed-petitions-cards").append($petitions);
}

function createSelectedPetitionElements(petitions) {
    petitionElements = [];

    array_json = petitions["petition"];

    var i;

    for (i = 0; i < array_json.length; i++) {
        $petition = $(".cloneable-selected-petitions").clone(true);
        $petition.removeClass('d-none cloneable-selected-petitions');
        $petition.find("#selected-card-title").text(array_json[i].title);
        $petition.find("#selected-card-content").text(array_json[i].content);
        $petition.find("#selected-card-id").text(array_json[i].id);
        $petition.find("#selected-card-created-at").text(formatDate(array_json[i].createdAt));

        petitionElements.push($petition)
    }
    return petitionElements;
}

function createOpenPetitionElements(petitions) {
    petitionElements = [];

    array_json = petitions["petition"];

    var i;

    for (i = 0; i < array_json.length; i++) {
        $petition = $(".cloneable-open-petitions").clone(true);
        $petition.removeClass('d-none cloneable-open-petitions');
        $petition.find("#open-card-title").text(array_json[i].title);
        $petition.find("#open-card-content").text(array_json[i].content);
        $petition.find("#open-card-id").text(array_json[i].id);
        $petition.find("#open-card-created-at").text(formatDate(array_json[i].createdAt));

        petitionElements.push($petition)
    }
    return petitionElements;
}

function createClosedPetitionElements(petitions) {
    petitionElements = [];

    array_json = petitions["petition"];

    var i;

    for (i = 0; i < array_json.length; i++) {
        $petition = $(".cloneable-closed-petitions").clone(true);
        $petition.removeClass('d-none cloneable-closed-petitions');
        $petition.find("#closed-card-title").text(array_json[i].title);
        $petition.find("#closed-card-content").text(array_json[i].content);
        $petition.find("#closed-card-id").text(array_json[i].id);
        $petition.find("#closed-card-created-at").text(formatDate(array_json[i].createdAt));

        petitionElements.push($petition)
    }
    return petitionElements;
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
