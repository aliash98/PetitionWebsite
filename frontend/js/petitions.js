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

    fetch('http://localhost:1337/petition/retrieve', {
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
                createAndAppendAllPetitions(json_obj);
            }
        })
    }
    ).catch(function (err) {
        console.log('Fetch Error :-S', err);
    });

    $(".all-p").on('click', function (e) {
        $allClickedCard = $(this).closest(".all-p");
        id = $allClickedCard.find("#all-card-id").text();
        sessionStorage.setItem("cardId", id);
        transitionToPage('sign.html');
    });
})

function createAndAppendClosedPetitions(allPetitions) {
    $allPetitions = createClosedPetitionElements(allPetitions);
    $("#all-petitions-cards").append($allPetitions);
}

function createAllPetitionElements(allPetitions) {
    allPetitionElements = [];

    array_json = allPetitions["petition"];

    var i;

    for (i = 0; i < array_json.length; i++) {
        $allPetitions = $(".cloneable-all-petitions").clone(true);
        $allPetitions.removeClass('d-none cloneable-all-petitions');
        $allPetitions.find("#all-card-title").text(array_json[i].title);
        $allPetitions.find("#all-card-content").text(array_json[i].content);
        $allPetitions.find("#all-card-id").text(array_json[i].id);
        $allPetitions.find("#all-card-created-at").text(formatDate(array_json[i].createdAt));
        $allPetitions.find("#all-card-due-date").text(formatDate(array_json[i].dueDate));

        allPetitionElements.push($allPetitions)
    }
    return allPetitionElements;
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

    return [year, month, day].join('/');
}
