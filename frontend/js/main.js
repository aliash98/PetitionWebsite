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
        $selectedClickedCard = $(this).closest(".selected-p");
        id = $selectedClickedCard.find("#selected-card-id").text();
        sessionStorage.setItem("cardId", id);
        transitionToPage('sign.html');
    });

    $(".open-p").on('click', function (e) {
        $openClickedCard = $(this).closest(".open-p");
        id = $openClickedCard.find("#open-card-id").text();
        sessionStorage.setItem("cardId", id);
        transitionToPage('sign.html');
    });

    $(".closed-p").on('click', function (e) {
        $closedClickedCard = $(this).closest(".closed-p");
        id = $closedClickedCard.find("#closed-card-id").text();
        sessionStorage.setItem("cardId", id);
        transitionToPage('sign.html');
    });
})

function createAndAppendSelectedPetitions(selectedPetitions) {
    $selectedPetitions = createSelectedPetitionElements(selectedPetitions);
    $("#selected-petitions-cards").append($selectedPetitions);
}

function createAndAppendOpenPetitions(openPetitions) {
    $openPetitions = createOpenPetitionElements(openPetitions);
    $("#open-petitions-cards").append($openPetitions);
}

function createAndAppendClosedPetitions(closedPetitions) {
    $closedPetitions = createClosedPetitionElements(closedPetitions);
    $("#closed-petitions-cards").append($closedPetitions);
}

function createSelectedPetitionElements(selectedPetitions) {
    selectedPetitionElements = [];

    array_json = selectedPetitions["petition"];

    var i;

    for (i = 0; i < array_json.length; i++) {
        $selectedPetitions = $(".cloneable-selected-petitions").clone(true);
        $selectedPetitions.removeClass('d-none cloneable-selected-petitions');
        $selectedPetitions.find("#selected-card-title").text(array_json[i].title);
        $selectedPetitions.find("#selected-card-content").text(array_json[i].content);
        $selectedPetitions.find("#selected-card-id").text(array_json[i].id);
        $selectedPetitions.find("#selected-card-created-at").text(formatDate(array_json[i].createdAt));

        selectedPetitionElements.push($selectedPetitions)
    }
    return selectedPetitionElements;
}

function createOpenPetitionElements(openPetitions) {
    openPetitionElements = [];

    array_json = openPetitions["petition"];

    var i;

    for (i = 0; i < array_json.length; i++) {
        $openPetitions = $(".cloneable-open-petitions").clone(true);
        $openPetitions.removeClass('d-none cloneable-open-petitions');
        $openPetitions.find("#open-card-title").text(array_json[i].title);
        $openPetitions.find("#open-card-content").text(array_json[i].content);
        $openPetitions.find("#open-card-id").text(array_json[i].id);
        $openPetitions.find("#open-card-created-at").text(formatDate(array_json[i].createdAt));

        openPetitionElements.push($openPetitions)
    }
    return openPetitionElements;
}

function createClosedPetitionElements(closedPetitions) {
    closedPetitionElements = [];

    array_json = closedPetitions["petition"];

    var i;

    for (i = 0; i < array_json.length; i++) {
        $closedPetitions = $(".cloneable-closed-petitions").clone(true);
        $closedPetitions.removeClass('d-none cloneable-closed-petitions');
        $closedPetitions.find("#closed-card-title").text(array_json[i].title);
        $closedPetitions.find("#closed-card-content").text(array_json[i].content);
        $closedPetitions.find("#closed-card-id").text(array_json[i].id);
        $closedPetitions.find("#closed-card-created-at").text(formatDate(array_json[i].createdAt));

        closedPetitionElements.push($closedPetitions)
    }
    return closedPetitionElements;
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
