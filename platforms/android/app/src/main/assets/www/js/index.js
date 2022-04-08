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
    page.data = { ...page.data, ...data };
    var newCurrent = page.init(page.data);
    document.getElementById("data").appendChild(newCurrent)
    newCurrent.style.animation = "pageSlide 250ms ease-out 0s 1 normal forwards";
    current = newCurrent;
}
var pad = (num, size) => {//padds a number with leading zerros  (4 => "04")
    num = num.toString();
    while (num.length < size) num = "0" + num;
    return num;
}
var post = async (link, data, header) => {
    if (typeof cordovaHTTP == "undefined") throw "cordovaHTTP not found";
    return new Promise((resolve, reject) => {
        cordovaHTTP.post(link, data, header, function (response) {
            try{
                //alert(response.data);
                response.data = JSON.parse(response.data);
                resolve(response.data);
            } catch(e){reject(e);}
        }, function (response) {
            reject("err2: " + response.status + " "+link);
        });
    });
}
var get = async (link, header) => {
    if (typeof cordovaHTTP == "undefined") throw "cordovaHTTP not found";
    return new Promise((resolve, reject) => {
        cordovaHTTP.get(link, {}, header, function (response) {
            try{
                response.data = JSON.parse(response.data);
                resolve(response.data);
            }catch(e){reject(e);}
        }, function (response) {
            reject("err1: " + response.status + " "+link);
        });
    });
}
function mouseEvent(e) {
    if (page.data.cancelEvent)
        if      (e.type == 'touchmove'  || e.type == 'mousemove') page.moveEvent(e, page.data);
        else if (e.type == 'touchstart' || e.type == 'mousedown') page.startEvent(e, page.data);
        else if (e.type == 'touchend'   || e.type == 'mouseup' || e.type == 'touchcancel') page.stopEvent(e, page.data);
}
function getStudent() {
    Somtoday.getPasswordToken(settings.som, "sj1011103@leerling.sintjan-lvo.nl", "9509466").then(() => {
        Somtoday.GetStudent(settings.som).then((val2) => {
            settings.som.student = val2;
            somReady = true;
        }).catch((e) => { alert("Error getting student data: " + e) });
    }).catch((e) => { alert("Error logining in to somtoday: " + e) });
}
async function init(isCordova) {//cordova.file.dataDirectory
    settings = { isDark: false, som: {}, zerm: {}, sceduleData: { data: [] } };
    if (isCordova) {
        try {
            settings.som.onTokenUpdate = () => { Filesystem.WriteFile("settings.json", settings); };
        } catch (e) {
            alert("Error idk: " + e);
        }
        window.open = cordova.InAppBrowser.open;
        await Filesystem.ReadFile("settings.json").then((o) => {
            if (o != null)
                settings = o;
            setColor(settings.isDark, true);
            document.body.className = settings.isDark ? 'black' : '';
        }).catch((e1) => Filesystem.WriteFile("settings.json", settings).catch((e2) => alert("Error saving/reading settings: " + e2 + " " + e1)));
        //await Somtoday.CheckAccessToken(settings.som).catch(getStudent);
        Somtoday.GetStudent(settings.som).then((val2) => {
            settings.som.student = val2;
            somReady = true;
        }).catch((e) => { alert("Error getting student data: " + e) });
        somReady = true;
        platform = device.platform;
    }
    setTimeout(()=>{
        try {
            loadScedule(3);
        } catch (e) {
            alert("Error loading scedule: " + e);
        }
    }, 1000);
};
async function loadScedule(weekDist) {
    var currentdate = new Date();
    var oneJan = new Date(currentdate.getFullYear(), 0, 1);
    var numberOfDays = Math.floor((currentdate - oneJan) / (24 * 60 * 60 * 1000)) + 1 - (7 - (oneJan.getDay() - 1));
    var result = Math.ceil(numberOfDays / 7);
    settings.sceduleData.min=result;
    settings.sceduleData.max=result;
    var loadData = async (week) => {
        var som = [];
        var zerm = [];
        som = await CashWeekSom(week);
        zerm = await CashWeekZerm(week);
        document.getElementById("debug").innerHTML = week;
        settings.sceduleData.data[week] = [...zerm, ...som];
    }
    try {
        await loadData(result);
        while (settings.sceduleData.max - result <= weekDist) {
            await loadData(settings.sceduleData.max + 1);
            settings.sceduleData.max++;
            await loadData(settings.sceduleData.min - 1);
            settings.sceduleData.min--;
        }
    } catch (e) {
        alert("Faild to gather scedule info please login to Somtoday and Zermelo ("+e+")");
        return;
    }
    Filesystem.WriteFile("settings.json", settings).catch(() => { });
}
var somReady = false;
var settings;
var page;
var platform;
var inAppBrowserRef;
var filesDir;
var current = null;
var backgroundAction = null;
var toRemove = [];

document.onmouseup = mouseEvent
document.onmousemove = mouseEvent
document.body.addEventListener("touchend", mouseEvent, false);
document.body.addEventListener("touchcancel", mouseEvent, false);
document.body.addEventListener("touchmove", mouseEvent, false);
document.getElementById("data").onmousedown = mouseEvent
document.getElementById("data").addEventListener("touchstart", mouseEvent, false);
document.addEventListener('deviceready', () => {
    try {
        init(true);
    } catch (e) {
        alert("Error during init: " + e);
    }
}, false)
setTab(0);
if (typeof (cordova) == "undefined") {
    //init(false);
}