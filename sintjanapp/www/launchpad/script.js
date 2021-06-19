var win;//the current In App Browser Window.
var som;//the current somtoday object
var saveSys;//the current save file
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

function onLoad() {//Gets called instantly when app starts.
	window.onerror = function (msg, url, line, col, error) {//displays all errors and alerts the user
		alert(!error ? '' : 'error: ' + error + " line: " + line + " url: " + url + " msg: " + msg);//the error object is null somtimes
		return true;//supres other error messages
	};
	som = new Somtoday();//create a somtoday object
	som.onTokenUpdate = function () {//when a new token is aquierd save it
		var objToSave = { "access_token": som.access_token, "refresh_token": som.refresh_token, "lastRequest": som.lastRequest };//create object to save
		saveSys.SaveJSON(objToSave);//save the object
	};
	document.addEventListener("deviceready", onDeviceReady, false);//Call the deviceready function when corodva is ready.
}
async function onDeviceReady() {//Gets called when corodva is ready.
	saveSys = await SaveSystem.GetFile("settings.spn");
	jsonObj = await saveSys.loadJSON();//loads the json out of the file (is null if the file is empty or corrupted)
	if (jsonObj != null)//if a valid json object exist overwrite all somtoday values
		Object.assign(som, jsonObj);
	const urlParams = new URLSearchParams(window.location.search);//gets the paramater in the url
	if (urlParams.get('email') != null)//if a email is specified in the paramaters, get a access token
		await som.GetToken("password", urlParams.get('password'), { "username": Somtoday.LVOBuuid + "\\" + urlParams.get('email') });
	var student = await som.GetStudent();//get student

	const pName = document.createElement("p");
	pName.innerText = "Hallo " + student.roepnaam + " " + student.achternaam;
	pName.className = "name";
	document.body.insertBefore(pName, document.getElementsByClassName("grid-container")[0]);
}
function openPage(url) {//open a page in the In App Browser
	win = cordova.InAppBrowser.open(url, "_blank", "location=yes");//Create a new window
	win.addEventListener('loaderror', async function (params) {//when the window runs into an error call this function (this happends when you login)
		win.close();//close the window
		var linkCode = params.url.substring(params.url.indexOf('=') + 1, params.url.indexOf('&'));//get the code from the login
		await som.GetToken("authorization_code", "", { "redirect_uri": "somtodayleerling://oauth/callback", "code_verifier": "t9b9-QCBB3hwdYa3UW2U2c9hhrhNzDdPww8Xp6wETWQ", "code": linkCode });//get acces token
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