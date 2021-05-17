function onLoad ()
{
    window.addEventListener("keydown", (event) => {
        if (event.keyCode == 13) { // Keycode for Enter
            sendChatMessage();
        }
    });

    localUserId = getCookie("playerId");

    canvas = document.getElementById("virtualroom");
    ctx = canvas.getContext("2d");

    initCanvas();
    renderCanvas();
}

// Less shamefully stolen from https://www.w3schools.com/js/js_cookies.asp. Seriously why are cookies so difficult to work with in JS?
function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
        c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
        }
    }
    return "";
}

function invert (object) {
    const res = {}
    Object.keys(object).forEach(key => {
        res[object[key]] = key
    })
    return res
}