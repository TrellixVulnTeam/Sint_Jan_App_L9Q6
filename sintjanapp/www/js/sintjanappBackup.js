var linkRE = /https:\/\/somtoday\.nl\/oidc\?code=([a-zA-Z0-9._\-]*)&state=[a-zA-Z0-9.-_]*#/gm;
var win;
var access_token = "";
function myFunction() {
  var x = document.getElementById("myTopnav");
  if (x.className === "topnav w3-container w3-card") {
    x.className += " responsive";
  } else {
    x.className = "topnav w3-container w3-card";
  }
}
function openApp(packageName, activityName, url){//nl.topicus.somtoday.leerling, nl.topicus.somtoday.leerlinglib.activity.SplashActivity, https://somtoday.nl/
	var sApp = cordova["plugins"]["startApp"].set({ /* params */
		"action":"ACTION_MAIN",
		"category":"CATEGORY_DEFAULT",
		"type":"text/css",
		"package":packageName,
		/*"uri":"file://data/index.html",*/
		"flags":["FLAG_ACTIVITY_CLEAR_TOP","FLAG_ACTIVITY_CLEAR_TASK"],
		"component": [packageName,activityName],
		"intentstart":"startActivity",
	});
	sApp.check(function(values) {
		sApp.start(function() {
		}, function(error) {
			alert(error);
		}, function() {
			console.log("done");
		});
	}, function(error) {
		openPage(url);
	});
}
function openPage(url){
	win = cordova.InAppBrowser.open(url,"_blank","location=yes");
	win.addEventListener('loaderror',function(params) {
		win.close();
        var linkCode = "code"+params.url.substring(params.url.indexOf('='),params.url.length);
		var xhr = new XMLHttpRequest();
		var url = "https://production.somtoday.nl/oauth2/token";
		xhr.open("POST", url);
		xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		xhr.onreadystatechange = function () {
		if (xhr.readyState === 4) {
			//alert(xhr.responseText);
			//alert(JSON.parse(xhr.responseText).access_token);
			access_token = JSON.parse(xhr.responseText).access_token;
			showName();
		}};
		var data = "grant_type=authorization_code&"+
				   "client_id=D50E0C06-32D1-4B41-A137-A9A850C892C2&"+
				   "client_secret=vDdWdKwPNaPCyhCDhaCnNeydyLxSGNJX&"+
				   "redirect_uri=somtodayleerling%3A%2F%2Foauth%2Fcallback&"+
				   "code_verifier=t9b9-QCBB3hwdYa3UW2U2c9hhrhNzDdPww8Xp6wETWQ&"+linkCode;
	
		xhr.send(data);
    });
	
}
function loadStopCallBack() {alert("start");}
function executeScriptCallBack(params) {alert(params);}
function som(x){
	if(!x)
		openApp("nl.topicus.somtoday.leerling", "nl.topicus.somtoday.leerlinglib.activity.SplashActivity", "https://somtoday.nl/");
	else
		openPage("https://somtoday.nl/");
}
function zermelo(x){
	if(!x)
		openApp("nl.zermelo.online.App","nl.zermelo.online.App.MainActivity","https://account.activedirectory.windowsazure.com/applications/signin/40a96122-51bb-430a-b504-6a225c51e676?tenantId=788de26b-bf5a-46d5-bb58-f35ff7bdd172");
	else
		openPage("https://account.activedirectory.windowsazure.com/applications/signin/40a96122-51bb-430a-b504-6a225c51e676?tenantId=788de26b-bf5a-46d5-bb58-f35ff7bdd172");
}
function itslearning(x){
	if(!x)
		openApp("com.itslearning.itslearningintapp","itslearning.app.common.ActivityAppStartingPoint","https://lvo.itslearning.com/");
	else
		openPage("https://lvo.itslearning.com/");
}
// example.js file
// Wait for device API libraries to load
//
function onLoad() {
    document.addEventListener("deviceready", onDeviceReady, false);
}

// device APIs are available
//
function onDeviceReady() {
    document.addEventListener("pause", onPause, false);
    document.addEventListener("resume", onResume, false);
    document.addEventListener("menubutton", onMenuKeyDown, false);
}
function onPause() {
    // Handle the pause event
}

function onResume() {
    // Handle the resume event
}

function onMenuKeyDown() {
    // Handle the menubutton event
}
function onSomtodayRedirect(event, callback) {
	alert(event.url);
	
	callback(event.url);
	
	if(event.url.startsWith("https://somtoday.nl/oidc?code=")) {
		var btn = document.createElement("p");   // Create a <p> element
		btn.innerHTML = event.url;                   // Insert text
		document.body.appendChild(btn);               // Append <button> to <body>
		var linkCode = event.url.replace("https://somtoday.nl/oidc?","").split("&")[0]+"..";
		//win.close();
		var xhr = new XMLHttpRequest();
		var url = "https://production.somtoday.nl/oauth2/token";
		xhr.open("POST", url);
		xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		xhr.onreadystatechange = function () {
		if (xhr.readyState === 4) {
			alert(event.url);
			alert(data);
			alert(xhr.responseText);
		}};
		var data = "grant_type=authorization_code&"+
				   "client_id=D50E0C06-32D1-4B41-A137-A9A850C892C2&"+
				   "client_secret=vDdWdKwPNaPCyhCDhaCnNeydyLxSGNJX&"+
				   "redirect_uri=somtodayleerling%3A%2F%2Foauth%2Fcallback&"+
				   "code_verifier=t9b9-QCBB3hwdYa3UW2U2c9hhrhNzDdPww8Xp6wETWQ&"+linkCode;
	
		//xhr.send(data);
	}
}
function showName(){
	var xhr = new XMLHttpRequest();
	var url = "https://api.somtoday.nl/rest/v1/leerlingen";
	xhr.open("GET", url);
	xhr.setRequestHeader("Authorization", 'Bearer '+access_token);
	xhr.setRequestHeader("Accept", 'application/json');
	xhr.onreadystatechange = function () {
	if (xhr.readyState === 4) {
		
		alert(JSON.parse(xhr.responseText).items[0].roepnaam+" "+JSON.parse(xhr.responseText).items[0].achternaam);// JSON.items[0].roepnaam+" "+xhr.responseJSON.items[0].achternaam);
	}};
	xhr.send();	
}