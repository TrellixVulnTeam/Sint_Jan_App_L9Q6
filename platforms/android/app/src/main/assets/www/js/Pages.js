var links = [
    { hasApp: false, img: "img/logosintjan.svg", name: "Sint-Jan", link: "https://www.sintjan-lvo.nl/" },
    { hasApp: true, img: "img/som.svg", name: "somtoday", androidURI: "nl.topicus.somtoday.leerling", iosURI: "somtodayleerling://", link: "https://somtoday.nl/" },
    { hasApp: true, img: "img/itl.svg", name: "itslearn", androidURI: "com.itslearning.itslearningintapp", iosURI: "itslearning://", link: "https://lvo.itslearning.com/" },
    { hasApp: true, img: "img/zrm.svg", name: "zermelo", link: "https://account.activedirectory.windowsazure.com/applications/signin/40a96122-51bb-430a-b504-6a225c51e676" },
    { hasApp: false, img: "img/off.svg", name: "office", link: "https://www.office.com/" }]
let Page = {
    init: (data) => { },
    endAnimation: (data) => { },
    unload: (data) => { },
    startEvent: (e, data) => { },
    moveEvent: (e, data) => { },
    stopEvent: (e, data) => { },
    data: { cancelEvent: false }
}
let openApplication = (id) => {
    var data = links[id];
    if (data.hasApp) {
        var app;
        if (platform === "iOS") {
            app = startApp.set(data.iosURI);
        } else {
            app = startApp.set({ 'package': data.androidURI, 'application': data.androidURI });
        }
        app.check(function (values) {
            app.start(function () { }, function (error) {
                alert("Failed to start External app (" + error + ")");
                inAppBrowserRef = window.open(data.link, '_blank', 'location=yes');
            });
        }, function (error) {
            inAppBrowserRef = window.open(data.link, '_blank', 'location=yes');
        });
    } else {
        inAppBrowserRef = window.open(data.link, '_blank', 'location=yes');
    }
}
const dt = 0.02;
const minVel = 200;
const smoothing = 0.75;
let getXfromEvent = (e) => {
    var evt = (typeof e.originalEvent === 'undefined') ? e : e.originalEvent;
    return (!(evt.touches === 'undefined' || evt.changedTouches)) ? e.clientX : (evt.touches[0] || evt.changedTouches[0]).pageX;
}
let updateScedule = (weekOffset, t) => {
    var c = current;
    if (t != null)
        c = t;
    var currentdate = new Date();
    var oneJan = new Date(currentdate.getFullYear(), 0, 1);
    var numberOfDays = Math.floor((currentdate - oneJan) / (24 * 60 * 60 * 1000)) + 1 - (7 - (oneJan.getDay() - 1));
    var result = Math.ceil(numberOfDays / 7);
    for (let i = 0; i < 3; i++) {
        var weekDays = ["ma","di","wo","do","vr"];//,"za","zo"];
        var header = c.children[i].getElementsByClassName("num")[0];
        while (header.hasChildNodes()) { header.removeChild(header.lastChild) }   
        for(let j = 0; j < 5; j++) {
            var day = document.createElement("p");
            day.innerText = weekDays[j];
            c.children[i].getElementsByClassName("num")[0].appendChild(day);
        }
        var parrent = c.children[i].children[1]
        while (parrent.hasChildNodes()) { parrent.removeChild(parrent.lastChild) }   
        try {  
            settings.sceduleData.data[result-1+i+weekOffset].forEach(week => {
                if(week.subject != null)
                    AddBlock(c, i, week.start, week.end, week.subject.afkorting + "<br>" + week.location + "<br>" + week.teacher, 5);
                else if(week.actions != null) {
                    AddBlock(c, i, week.start, week.end, "KWT", 5, () => {setTab(5, week.actions);});
                }
            });
        } catch (err) {
            console.log(err);
        }
    }
}
let AddBlock = (root, pageId, beginTime, endTime, innerHTML, maxday, onClick) => {
    var left = (beginTime.getDay() - 1) * 100 / maxday;
    var dayBegin = new Date(beginTime);
    dayBegin.setMinutes(30);
    dayBegin.setHours(8);
    var time = (beginTime - dayBegin) / 1000 / 60 / 50 / 8 * 64;
    var length = (endTime - beginTime) / 1000 / 60 / 50 / 8 * 64;

    var newdiv = document.createElement("div");
    newdiv.className = "sceduleTile";
    newdiv.style.position = "absolute";
    newdiv.style.top = "calc(8vh + " + time + "vh)";
    newdiv.style.left = left + "%";
    newdiv.innerHTML = innerHTML;
    newdiv.style.width = 100/maxday+"%";
    newdiv.style.height = length + "vh";
    newdiv.onclick = onClick;
    root.children[pageId].children[1].appendChild(newdiv);
}
let CashWeekSom = async (weekNumber) => {
    var first = new Date();
    first.setMonth(0);
    first.setDate(1);
    first.setDate(2 - first.getDay() + 7 * weekNumber);
    var last = new Date(first.getTime() + 1000 * 3600 * 24 * 7)
    let sc = await Somtoday.GetScedule(settings.som, first, last);
    return sc.items.map((item) => {
        return {
            teacher: item.additionalObjects.docentAfkortingen,
            subject: item.additionalObjects.vak,
            start: new Date(item.beginDatumTijd),
            end: new Date(item.eindDatumTijd),
            location: item.locatie,
    }});
}
let CashWeekZerm = async (weekNumber) => {
    let sc = await Zermelo.GetScedule(settings.zerm, 2022, weekNumber);
    return sc.filter(item => item.appointmentType == "choice").map((item) => {return {
            start: new Date(item.start * 1000),
            end: new Date(item.end * 1000),
            actions: item.actions.map(item => {return {
                    allowed: item.appointment.allowedActions,
                    subjects: item.appointment.subjects,
                    locations: item.appointment.locations,
                    teachers: item.appointment.teachers,
                    post: item.post,
    }}),}});
}
let setColor = (e, saved) => {
    if (e) {
        document.documentElement.style.setProperty('--text-color', "255,255,255");
        document.documentElement.style.setProperty('--background-color', "0,0,0");
        document.documentElement.style.setProperty('--accent-color', "48,48,48");
    } else {
        document.documentElement.style.setProperty('--text-color', "0,0,0");
        document.documentElement.style.setProperty('--background-color', "255,255,255");
        document.documentElement.style.setProperty('--accent-color', "244,244,244");
    }
    settings.isDark = e;
    if(!saved)
        Filesystem.WriteFile("settings.json", settings).catch(() => { });
};
let test = async (e) => {
    alert("test");
    var val = e.srcElement.parentElement.getElementsByTagName("input")[0].value;
    alert(val);
    await Zermelo.GetToken(settings.zerm, val);
    alert(settings.zerm.access_token);
    Filesystem.WriteFile("settings.json", settings).catch(() => { });
}
var pages = [];
pages.push({
    ...Page,
    init: () => {
        let element = document.createElement("div");
        element.style.cssText = "height: 100%; flex-flow: row wrap; place-content: flex-start center;";
        element.classList.add("container");
        element.classList.add("centreChild");
        for (let i = 1; i < links.length; i++)
            element.innerHTML +=
                "<div style='padding:2vw'>" +
                "<img class='shadow' style='width:40vw' alt=" + links[i].name + " src=" + links[i].img + " onclick=\"openApplication(" + i + ")\">" +
                "</div>";
        return element;
    }
});
pages.push({
    ...Page,
    init: () => {
        let element = document.createElement("div");
        element.classList.add("container");
        element.style.cssText = "height:100%";
        if (somReady)
            Somtoday.GetGrades(settings.som, settings.som.student.items[0].links[0].id).then((val3) => {
                var names = Object.keys(val3);
                for (let i = 0; i < names.length; i++) {
                    let button = document.createElement("p");
                    button.classList.add("task");
                    button.onclick = () => { setTab(4, [names[i], val3[names[i]]]); };
                    button.innerHTML = names[i];
                    element.appendChild(button);
                }
            }).catch((err) => { alert("Error: " + err) });
        return element;
    }
});
pages.push({
    ...Page,
    init: (data) => {
        let element = document.createElement("div");
        for (let i = 0; i < 3; i++) {
            element.innerHTML +=
                "<div style='width:100vw; position:absolute; transform:translate(" + ((i - 1) * 100) + "vw,0px)'>" +
                "<div class='container' style='height:8vh'><p style='display: flex;flex-direction: row;flex-wrap: nowrap;align-content: stretch;justify-content: space-around;align-items: center;' class='num'></div>" +
                "<div class='container' style='height:72vh;top:8vh'>" + "</div>" +
                "</div>";
        }

        element.firstChild.style.display = "none";
        data.interval = setInterval(() => {
            if (!data.dragging) data.x *= smoothing
            for (let i = 0; i < 3; i++) Object.assign(element.children[i].style, { left: data.x + "px" })
            data.vel = (data.dx / dt);
            data.dx = 0
        }, dt * 1000)
        updateScedule(data.weekOffset, element);
        return element;
    },
    endAnimation: () => { current.firstChild.style.display = "block"; },
    unload: (data) => clearInterval(data.interval),
    startEvent: (e, data) => {
        data.dragging = true;
        data.lastPos = getXfromEvent(e);
    },
    moveEvent: (e, data) => {
        if (data.dragging) {
            var x = getXfromEvent(e);
            data.dx += x - data.lastPos;
            data.x += x - data.lastPos;
            data.lastPos = x;
        }
    },
    stopEvent: (_, data) => {
        data.dragging = false;
        if (Math.abs(data.vel) > minVel) {
            const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
            if (data.vel > minVel) { data.x -= vw; data.weekOffset--; updateScedule(data.weekOffset) }
            else if (data.vel < -minVel) { data.x += vw; data.weekOffset++; updateScedule(data.weekOffset) }
        }
    },
    data: { dragging: false, vel: 0, x: 0, weekOffset: 0, lastPos: 0, dx: 0, interval: -1, cancelEvent: true }
});
pages.push({
    ...Page,
    init: () => {
        let element = document.createElement("div");
        element.classList.add("container");
        element.style.cssText = "height:100%";
        element.innerHTML =
            "<div>" +
            "Dark mode: <input type='checkbox' id='darkMode'>" +
            "</div>"+
            "<br>" +
            //"<p onClick='setTab(6)'>open debug</p>" +
            "<button class='btn' style=\"width:50vw\" onclick='Somtoday.setLoginWindow(settings.som,window.open(Somtoday.loginLink, \"_blank\", \"location=yes,beforeload=yes\"))'>Somtoday Login</button>" +
            "<br>"+
            "<div style=\"width:50vw\">" +
            "<input value='zerm code' style=\"width:100%;height:1.5em\"/>" +
            "<button class='btn'>Zermelo Login</button>" +
            "</div>";
        element.children[0].onchange = (e) => setColor(e.srcElement.checked);
        element.lastChild.lastChild.onclick = test;
        if (settings != null)
            element.children[0].checked = (settings.isDark == true) ? true : false;
        return element;
    }
});
pages.push({
    ...Page,
    init: (data) => {
        var saves = ["herkansingstype",
            "resultaat",
            "geldendResultaat",
            "datumInvoer",
            "teltNietmee",
            "toetsNietGemaakt",
            "leerjaar",
            "periode",
            "weging",
            "examenWeging",
            "isExamendossierResultaat",
            "isVoortgangsdossierResultaat",
            "type",
            "omschrijving"];
        var newData = [];
        for (var j = 0; j < data[1].length; j++) {
            newData[j] = {};
            for (var i = 0; i < saves.length; i++) {
                newData[j][saves[i]] = data[1][j][saves[i]]
            }
        }
        //alert(JSON.stringify(newData));
        let element = document.createElement("div");
        element.classList.add("container");
        element.style.cssText = "height:100%";
        let view = document.createElement("div");
        view.innerHTML = "<h1 class='gradeName'>" + data[0] + "</h1>";
        element.appendChild(view);
        var total = 0;
        var weight = 0;
        for (let i = 0; i < data[1].length; i++)
            if (data[1][i].type == "Toetskolom") {
                weight += data[1][i].weging;
                total += data[1][i].resultaat * data[1][i].weging;
                view.innerHTML +=
                    "<div class='sceduleTile' style='display:flex'>" +
                    "<p class='gradeValue' style ='font-size:35px'>" + data[1][i].resultaat + "</p>" +
                    "<p class='gradeWeight' style='font-size:15px'>x" + data[1][i].weging + "</p>" +
                    "</div>";
            }
        view.innerHTML += "<div><p style ='font-size:35px'>Gemiddelde:" + ((Math.round(total * 10 / weight)) / 10) + "</p></div>";
        return element;
    }
});
pages.push({
    ...Page,
    init: (data) => {
        let element = document.createElement("div");
        element.classList.add("container");
        element.style.cssText = "height:100%";
        for (let i = 0; i < Object.keys(data).length -1; i++) {
            element.innerHTML += "<div class='sceduleTile'>" + data[i].teachers[0] + "<br>" + data[i].locations[0] + "<br>" + data[i].subjects[0] + "</div>";
        }

        return element;
    }
});
pages.push({
    ...Page,
    init: () => {
        Zermelo.GetScedule(settings.zerm, 0, 0).then((data) => {
            settings.zerm.kwtUren = {};
            for (var i = 0; i < data.appointments.length; i++) {
                kwtUren[data.appointments[i].start + ""] = [];
                for (var j = 0; j < data.appointments[i].actions.length; j++) {
                    var appointment = data.appointments[i].actions[j].appointment;
                    kwtUren[data.appointments[i].start + ""].push({ subject: appointment.subjects[0], location: appointment.locations[0], teacher: appointment.teachers[0] });
                }
            }
        }).catch((e) => { alert("Error debug: " + e) });
        let element = document.createElement("div");
        return element;
    }
});