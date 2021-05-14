var page;//contains the current page name
var win;//the current In App Browser Window.
var som;//the current somtoday object
var saveSys;//the current save file
var teachers;//stores all teacher names
var appDict = {//stores all links
	"somtoday": {
		"uri": "nl.topicus.somtoday.leerling",
		"url": "https://somtoday.nl/",
		"activity": "nl.topicus.somtoday.leerlinglib.activity.SplashActivity"
	},
	"zermelo": {
		"uri": "nl.zermelo.online.App",
		"url": "https://account.activedirectory.windowsazure.com/applications/signin/40a96122-51bb-430a-b504-6a225c51e676?tenantId=788de26b-bf5a-46d5-bb58-f35ff7bdd172",
		"activity": "nl.zermelo.online.App.MainActivity"
	},
	"itslearning": {
		"uri": "com.itslearning.itslearningintapp",
		"url": "https://lvo.itslearning.com/",
		"activity": "itslearning.app.common.ActivityAppStartingPoint"
	}
};
function onLoad(pageName) {//Gets called instantly when app starts.
	page = pageName;
	window.onerror = function (msg, url, line, col, error) {//handels all errors and alerts the user
		alert(!error ? '' : 'error: ' + error + " line: " + line);//the error object is null somtimes
		return true;//supres other error messages
	};
	document.addEventListener("deviceready", onDeviceReady, false);//Call the deviceready function when corodva is ready.
}
async function onDeviceReady() {//Gets called when corodva is ready.
	fetch("https://raw.githubusercontent.com/jktechs/Sint_Jan_App/main/LerarenSintJan.json").then((v) => { teachers = v.json() });
	som = new Somtoday();//create a somtoday object
	som.onTokenUpdate = function () {//if a new token is aquierd save it
		var objToSave = { "password": som.password, "email": som.email, "access_token": som.access_token, "refresh_token": som.refresh_token, "lastRequest": som.lastRequest };//create object to save
		saveSys.SaveJSON(objToSave);//save the object
	};
	saveSys = await SaveSystem.GetFile("settings.spn");

	jsonObj = await saveSys.loadJSON();//function () {//loads the json out of the file (is null if the file is empty or corrupted)
	if (jsonObj != null)//if a valid json object exist overwrite all somtoday values
		Object.assign(som, jsonObj);
	const urlParams = new URLSearchParams(window.location.search);//gets the paramater in the url
	if (urlParams.get('email') != null)//if an email is specified in the paramaters, overwirte the old one
		som.email = urlParams.get('email');
	if (urlParams.get('password') != null)//if a password is specified in the paramaters, overwirte the old one
		som.password = urlParams.get('password');
	if (urlParams.get('save') == "true")//if the login data from the paramaters should be remembered, save them
		som.onTokenUpdate();
	switch (page) {
		case "main":
			var student = await som.GetStudent();
			alert(student.roepnaam + " " + student.achternaam);
			printscedule();
			break;
		case "sced":
			printscedule();
			break;
    }
}
async function printscedule() {//print scedule to html document
	var currentdate = new Date(); //gets date
	var nextdate = new Date(currentdate.getTime() + 60 * 60 * 24 * 1000)
	var begindate = currentdate.getFullYear() + "-" + pad(currentdate.getMonth() + 1, 2) + "-" + pad(currentdate.getDate(), 2);
	var enddate = nextdate.getFullYear() + "-" + pad(nextdate.getMonth() + 1, 2) + "-" + pad(nextdate.getDate(), 2);

	var scedule = await som.GetScedule(begindate, enddate);//gets scedule object
	for (var i = 0; i < scedule.length; i++) {//for every scedule entry
		var fullName = scedule[i].additionalObjects.vak.naam;//gets the name of the subject
		var beginTime = scedule[i].beginDatumTijd.substring(11, 16);//gets the begin time of the subject
		var endTime = scedule[i].eindDatumTijd.substring(11, 16);//gets the end time of the subject
		var enabled = scedule[i].afspraakStatus == 'ACTIEF';//check if subject is going to happen
		var teacher = scedule[i].additionalObjects.docentAfkortingen;//get techer code
		var name = scedule[i].additionalObjects.vak.afkorting;//get short name of subject
		var location = scedule[i].locatie;//get location of subject
		if (enabled) {//if subject is going to happen
			var element = document.createElement("p");//create p object (<p></p>)
			element.innerText = fullName + " " + beginTime + " " + endTime + " " + location + " " + teachers[teacher].name + " " + name;//sets text of p element (<p>Wiskunde 10:40 11:30 sa204 lij22 wi</p>)
			document.getElementById("scedule").appendChild(element);//add element to the end of the document
		}
	}
}
function openPage(url) {//open a page in the In App Browser
	win = cordova.InAppBrowser.open(url, "_blank", "location=yes");//Create a new window
	win.addEventListener('loaderror', function (params) {//when the window runs into an error call this function (this happends when you login)
		win.close();//close the window
		var linkCode = "code" + params.url.substring(params.url.indexOf('='), params.url.length);//get the code from the logine
		som.GetAuthToken(linkCode, function (xhr) { som.GetStudent(function (student) { alert(student.roepnaam + " " + som.student.achternaam); printscedule(); }); });
	});
}
function openApplication(app, forceWebsite) {
	if (!forceWebsite) {
		var sApp = cordova["plugins"]["startApp"].set({//set settings for opening the app
			"action": "ACTION_MAIN",
			"category": "CATEGORY_DEFAULT",
			"type": "text/css",
			"package": app.uri,
			"flags": ["FLAG_ACTIVITY_CLEAR_TOP", "FLAG_ACTIVITY_CLEAR_TASK"],
			"component": [app.uri, app.activity],
			"intentstart": "startActivity",
		});
		sApp.check(function (values) {//check if app exists
			sApp.start(function () {//if it does start the app
			}, function (error) {//if the app exists but there is still an error alert the user.
				alert(error);
			}, function () { });
		}, function (error) {//if the app doesn't exist open the website
			openPage(app.url);
		});
	} else {
		openPage(app.url);
	}
}
function pad(num, size) {//padds a number with leading zerros  (4->"04")
	num = num.toString();
	while (num.length < size) num = "0" + num;
	return num;
}