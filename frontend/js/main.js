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
})