var win;
var access_token = "";
function openApp(packageName, activityName, url){//Try to open an app. If the app can't be found redirect to page.
	var sApp = cordova["plugins"]["startApp"].set({//paramaters for the openApp plugin
		"action":"ACTION_MAIN",
		"category":"CATEGORY_DEFAULT",
		"type":"text/css",
		"package":packageName,
		"flags":["FLAG_ACTIVITY_CLEAR_TOP","FLAG_ACTIVITY_CLEAR_TASK"],
		"component": [packageName,activityName],
		"intentstart":"startActivity",
	});
	sApp.check(function(values) {//Check if app exists on phone.
		sApp.start(function() {//If app is found, start it 
		}, function(error) {//if there is an error 
			alert(error);
		}, function() {
		});
	}, function(error) {//If app can't be found, start site.
		openPage(url);
	});
}
function openPage(url){//Open page in inAppBrowser plugin
	win = cordova.InAppBrowser.open(url,"_blank","location=yes");//Open page
	win.addEventListener('loaderror',function(params) {//Check if there is an error
		win.close();//Close the window
		var xhr = new XMLHttpRequest();//Create Http request
		var url = "https://production.somtoday.nl/oauth2/token";
		xhr.open("POST", url);//Open Post request
		xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");//set Content header (were the infe comes from)
		xhr.onreadystatechange = function () {
		if (xhr.readyState === 4) {//If the request return succesfully
			access_token = JSON.parse(xhr.responseText).access_token;//Get Somtoday acces token
			showName();//get user info
		}};
        var linkCode = "code"+params.url.substring(params.url.indexOf('='),params.url.length);//Create urlencoded data
		var data = "grant_type=authorization_code&"+
				   "client_id=D50E0C06-32D1-4B41-A137-A9A850C892C2&"+
				   "client_secret=vDdWdKwPNaPCyhCDhaCnNeydyLxSGNJX&"+
				   "redirect_uri=somtodayleerling%3A%2F%2Foauth%2Fcallback&"+
				   "code_verifier=t9b9-QCBB3hwdYa3UW2U2c9hhrhNzDdPww8Xp6wETWQ&"+linkCode;
	
		xhr.send(data);//Send the request
    });
	
}
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
function onLoad() {//Set event when cordova is ready.
    document.addEventListener("deviceready", onDeviceReady, false);
}
function onDeviceReady() {
	//on deviceready
}
function showName() {
	var xhr = new XMLHttpRequest();//Creates request
	var url = "https://api.somtoday.nl/rest/v1/leerlingen";
	xhr.open("GET", url);//Opens get request
	xhr.setRequestHeader("Authorization", 'Bearer '+access_token);//Set Auth token.
	xhr.setRequestHeader("Accept", 'application/json');//Sets accept header to JSON format.
	xhr.onreadystatechange = function () {
	if (xhr.readyState === 4) {//If Get request if succesfull send alert with name.
		alert(JSON.parse(xhr.responseText).items[0].roepnaam+" "+JSON.parse(xhr.responseText).items[0].achternaam);// JSON.items[0].roepnaam+" "+xhr.responseJSON.items[0].achternaam);
	}};
	xhr.send();	//Sends request
	//var btn = document.createElement("p");   // Create a <p> element
	//btn.innerHTML = event.url;               // Insert text
	//document.body.appendChild(btn);          // Append <button> to <body>
}