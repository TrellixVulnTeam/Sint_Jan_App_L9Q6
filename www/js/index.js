function setTab(x, data) {
    if (pages[x] == page && data == null)
        return;
    var oldCurrent = current;
    if (oldCurrent !== null) {
        setTimeout(function () {
            var rm = toRemove.splice(0, 1)[0];
            rm[0].remove();
            rm[1].unload(rm[1].data);
            page.endAnimation();
            current.style.animation = "";
        }, 250);
        toRemove.push([oldCurrent, page]);
    }
    page = pages[x];
    page.data = {...page.data, ...data};
    var newCurrent = page.init(page.data);
    document.getElementById("data").appendChild(newCurrent)
    newCurrent.style.animation = "pageSlide 250ms ease-out 0s 1 normal forwards";
    current = newCurrent;
}
function mouseEvent(e) {
    if (page.data.cancelEvent)
        if (e.type == 'touchmove' || e.type == 'mousemove') page.moveEvent(e,page.data);
        else if (e.type == 'touchstart' || e.type == 'mousedown') page.startEvent(e,page.data);
        else if (e.type == 'touchend' || e.type == 'mouseup' || e.type == 'touchcancel') page.stopEvent(e,page.data);
}
function getStudent() {
    Somtoday.getPasswordToken(settings.som, "sj1011103@leerling.sintjan-lvo.nl", "9509466").then(() => {
        Somtoday.GetStudent(settings.som).then((val2) => {
            settings.som.student = val2;
            somReady = true;
        }).catch((e)=>{alert("Error getting student data: "+e)});
    }).catch((e)=>{alert("Error logining in to somtoday: "+e)});
}
async function init(isCordova) {//cordova.file.dataDirectory
    settings = { isDark: false, som:{}, zerm:{} };
    if(isCordova) {
        await Filesystem.ReadFile("settings.json").then((o) => {
            if (o != null)
                settings = o;
            document.body.className = settings.isDark ? 'black' : '';
        }).catch((e1) => Filesystem.WriteFile("settings.json", settings).catch((e2) => alert("Error saving/reading settings: "+e2+" "+e1)));
        await Somtoday.CheckAccessToken(settings.som).catch(getStudent);
        somReady = true;
        window.open = cordova.InAppBrowser.open;
        platform = device.platform;
    }
};
var somReady = false;
var settings;
var page;
var platform;
var inAppBrowserRef;
var filesDir;
var current = null;
var toRemove = [];

document.onmouseup = mouseEvent
document.onmousemove = mouseEvent
document.body.addEventListener("touchend", mouseEvent, false);
document.body.addEventListener("touchcancel", mouseEvent, false);
document.body.addEventListener("touchmove", mouseEvent, false);
document.getElementById("data").onmousedown = mouseEvent
document.getElementById("data").addEventListener("touchstart", mouseEvent, false);
document.addEventListener('deviceready', ()=>{init(true);}, false)
setTab(0);
if(typeof(cordova) == "undefined"){
    init(false);
}