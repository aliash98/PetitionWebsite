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
                createAndAppendPetitions(json_obj);
            }
            // else {
            //     $("#no-post-alert").removeClass("d-none");
            // }
        })
    }
    ).catch(function (err) {
        console.log('Fetch Error :-S', err);
    });
})

function createAndAppendPetitions(petitions) {
    $petitions = createPetitionElements(petitions);
    $("#selected-petitions-cards").append($petitions);
}

function createPetitionElements(petitions) {
    petitionElements = [];

    array_json = petitions["post"];

    var i;

    // if (!Array.isArray(array_json)) {
    //     array_json = [];
    //     array_json.push(posts["post"]);
    // }

    for (i = 0; i < array_json.length; i++) {
        $petition = $(".cloneable-selected-petitions").clone(true);
        $petition.removeClass('d-none cloneable-selected-petitions');

        $petition.find("#selected-card-title").text(array_json[i].title);
        $petition.find("#selected-card-content").text(array_json[i].content);
        // $post.find(".post-author").text(array_json[i].created_by.id);
        $petition.find("#selected-card-created-at").text(formatDate(array_json[i].createdAt));

        // $post.find(".remove-post-container").attr("data-pid", array_json[i].id).on('click', function (e) {
        //     deletePostRequest($(this).data("pid"), $(this).closest(".post-container"));
        // });

        // $post.find(".edit-post-container").attr("data-pid", array_json[i].id);
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
