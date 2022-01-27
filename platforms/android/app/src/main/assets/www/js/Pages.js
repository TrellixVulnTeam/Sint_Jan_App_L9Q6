var links = [
    { hasApp: true, img: "img/som.svg", name: "somtoday", androidURI: "nl.topicus.somtoday.leerling", iosURI: "somtodayleerling://", link: "https://somtoday.nl/" },
    { hasApp: true, img: "img/itl.svg", name: "itslearn", androidURI: "com.itslearning.itslearningintapp", iosURI: "itslearning://", link: "https://lvo.itslearning.com/" },
    { hasApp: true, img: "img/zrm.svg", name: "zermelo", link: "https://account.activedirectory.windowsazure.com/applications/signin/40a96122-51bb-430a-b504-6a225c51e676" },
    { hasApp: false, img: "img/off.svg", name: "office", link: "https://www.office.com/" }]
let Page = {
    init: (data) => { },
    endAnimation: (data) => { },
    unload: (data) => { },
    startEvent: (e,data) => { },
    moveEvent: (e,data) => { },
    stopEvent: (e,data) => { },
    data: {cancelEvent: false}
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
                alert("ext app start fail (" + error + ")");
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
    var first = new Date();
    first.setDate(first.getDate() - first.getDay() - 6 + weekOffset * 7);
    first.setHours(0);
    settings.zerm.kwtUren = [];
    let parseKwt = (data) => {
        //alert(JSON.stringify(data));
        for(var i = 0;i<data.length;i++){
            var weekNum = Math.floor((data[i].startDate - first) / (1000 * 60 * 60 * 24 * 7));
            settings.zerm.kwtUren[weekNum] = [];
            for(var j = 0;j<data[i].actions.length;j++){
                if(data[i].actions[j].post != null)
                    alert(data[i].actions[j].post);
            }
        }
    }
    var last = new Date(first.getTime() + 1000 * 3600 * 24 * 7 * 3)
    Zermelo.GetScedule(settings.zerm, 2022,3).then(parseKwt).then(()=>{
        Zermelo.GetScedule(settings.zerm, 2022,4).then(parseKwt).then(()=>{
            Zermelo.GetScedule(settings.zerm, 2022,5).then(parseKwt).then(()=>{
            }).catch((err)=>{alert(err)});
        }).catch((err)=>{alert(err)});
    }).catch((err)=>{alert(err)});
    if(somReady)
        Somtoday.GetScedule(settings.som, first, last).then((sc) => {
            var sceduleData = [[], [], []]
            var maxday = [-1, -1, -1]
            for (var i = 0; i < sc.items.length; i++) {
                var beginTime = new Date(sc.items[i].beginDatumTijd);
                var weekNum = Math.floor((beginTime - first) / 3600 / 24 / 7 / 1000);
                var teacher = sc.items[i].additionalObjects.docentAfkortingen;//get techer code
                var endTime = new Date(sc.items[i].eindDatumTijd);//gets the end time of the subject
                //var name = sc.items[i].additionalObjects.vak.afkorting;//get short name of subject
                var name = sc.items[i].titel;
                var location = sc.items[i].locatie;//get location of subject
                if (maxday[weekNum] < beginTime.getDay() - 1)
                    maxday[weekNum] = beginTime.getDay() - 1
                sceduleData[weekNum][sceduleData[weekNum].length] = { "teacher": teacher, "beginTime": beginTime, "endTime": endTime, "name": name, "location": location };
            }
            for (let i = 0; i < 3; i++) {
                maxday[i]++;
                c.children[i].getElementsByClassName("num")[0].innerText = (i - 1) + "p" + (weekOffset)
                var parrent = current.children[i].children[1]
                while (parrent.hasChildNodes()) { parrent.removeChild(parrent.lastChild) }
                for (let j = 0; j < sceduleData[i].length; j++) {
                    var left = (sceduleData[i][j].beginTime.getDay() - 1) * 100 / maxday[i];
                    var dayBegin = new Date(sceduleData[i][j].beginTime);
                    dayBegin.setMinutes(30);
                    dayBegin.setHours(8);
                    var time = (sceduleData[i][j].beginTime - dayBegin) / 1000 / 60 / 50 / 8 * 64;
                    var length = (sceduleData[i][j].endTime - sceduleData[i][j].beginTime) / 1000 / 60 / 50 / 8 * 64;
                    c.children[i].children[1].innerHTML += "<div style='position:absolute;top:calc(8vh + " + time + "vh);left:" + left + "%;width:14%;height:" + length + "vh;background:gray'>" + sceduleData[i][j].location + "<br>" + sceduleData[i][j].teacher + "</div>"
                }
            }
        }).catch((e)=>{alert("Error scedule: "+e)});
}
let setColor = (e) => {
    if(e) {
        document.documentElement.style.setProperty('--text-color',"255,255,255");
        document.documentElement.style.setProperty('--background-color',"0,0,0");
        document.documentElement.style.setProperty('--accent-color',"48,48,48");
    } else {
        document.documentElement.style.setProperty('--text-color',"0,0,0");
        document.documentElement.style.setProperty('--background-color',"255,255,255");
        document.documentElement.style.setProperty('--accent-color',"244,244,244");
    }
    settings.isDark = e;
    Filesystem.WriteFile("settings.json", settings).catch(() => {});
};
let test = async (e) => {
    var val = e.srcElement.parentElement.getElementsByTagName("input")[1].value;
    alert(val);
    await Zermelo.GetToken(settings.zerm, val);
    Filesystem.WriteFile("settings.json", settings).catch(() => {});
}
var pages = [];
pages.push({
    ...Page,
    init: () => {
        let element = document.createElement("div");
        element.style.cssText = "height: 100%; flex-flow: row wrap; place-content: flex-start center;";
        element.classList.add("container");
        element.classList.add("centreChild");
        for (let i = 0; i < links.length; i++)
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
        if(somReady)
            Somtoday.GetGrades(settings.som, settings.som.student.items[0].links[0].id).then((val3) => {
                var names = Object.keys(val3);
                for (let i = 0; i < names.length; i++) {
                    let button = document.createElement("p");
                    button.classList.add("task");
                    button.onclick = () => {setTab(4, [names[i],val3[names[i]]]);};
                    button.innerHTML = names[i];
                    element.appendChild(button);
                }
            }).catch((err) => {alert("Error: "+err)});
        return element;
    }
});
pages.push({
    ...Page,
    init: (data) => {
        let element = document.createElement("div");
        for (let i = 0; i < 3; i++){
            element.innerHTML +=
                "<div style='width:100vw; position:absolute; transform:translate(" + ((i - 1) * 100) + "vw,0px)'>" +
                "<div class='container' style='height:8vh'><p style='text-align:center' class='num'>" + (i - 1) + "p" + i + "</p></div>" +
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
    startEvent: (e,data) => {
        data.dragging = true;
        data.lastPos = getXfromEvent(e);
    },
    moveEvent: (e,data) => {
        if (data.dragging) {
            var x = getXfromEvent(e);
            data.dx += x - data.lastPos;
            data.x += x - data.lastPos;
            data.lastPos = x;
        }
    },
    stopEvent: (_,data) => {
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
        element.innerHTML = "Dark mode: <input type='checkbox' id='darkMode'><p onClick='setTab(5)'>open debug</p><input value='zerm code'/><button class='btn'>sendZerm</button>";
        element.children[0].onchange = (e)=>setColor(e.srcElement.checked);
        element.lastChild.onclick = test;
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
        for(var j = 0;j<data[1].length;j++) {
            newData[j] = {};
            for(var i = 0;i<saves.length;i++) {
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
            if(data[1][i].type == "Toetskolom") {
                weight += data[1][i].weging;
                total += data[1][i].resultaat * data[1][i].weging;
                view.innerHTML +=
                    "<div style='display:flex'>" +
                        "<p class='gradeValue' style ='font-size:35px'>" + data[1][i].resultaat + "</p>" +
                        "<p class='gradeWeight' style='font-size:15px'>x" + data[1][i].weging + "</p>" +
                    "</div>";
            }
        view.innerHTML += "<div><p>" + ((Math.round(total*10/weight))/10) + "</p></div>";
        return element;
    }
});
pages.push({
    ...Page,
    init: () => {
        Zermelo.GetScedule(settings.zerm, 0,0).then((data)=>{
            settings.zerm.kwtUren = {};
            for(var i = 0;i<data.appointments.length;i++){
                kwtUren[data.appointments[i].start+""] = [];
                for(var j = 0;j<data.appointments[i].actions.length;j++){
                    var appointment = data.appointments[i].actions[j].appointment;
                    kwtUren[data.appointments[i].start+""].push({subject:appointment.subjects[0],location:appointment.locations[0],teacher:appointment.teachers[0]});
                }
            }
        }).catch((e)=>{alert("Error debug: "+e)});
        let element = document.createElement("div");
        return element;
    }
});