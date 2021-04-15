var win;
var em = "";
var pas = "";
var access_token = "";
var lvobuuid = "d091c475-43f3-494f-8b1a-84946a5c2142";
function onLoad() {
    document.addEventListener("deviceready", onDeviceReady, false);
}
function onDeviceReady() {
	const urlParams = new URLSearchParams(window.location.search);
	loadLogin(function () {
		if(urlParams.get('email') != null)
			em = urlParams.get('email');
		if(urlParams.get('password') != null)
			pas = urlParams.get('password');
		if(urlParams.get('rem') == "true")
			saveLogin(em,pas);
		login(showName);
	});
}
function openApp(packageName, activityName, url){
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
			access_token = JSON.parse(xhr.responseText).access_token;
			showName();
		}};
		var data = "grant_type=authorization_code&"+
				   "client_id=D50E0C06-32D1-4B41-A137-A9A850C892C2&"+
				   //"client_secret=vDdWdKwPNaPCyhCDhaCnNeydyLxSGNJX&"+
				   "redirect_uri=somtodayleerling%3A%2F%2Foauth%2Fcallback&"+
				   "code_verifier=t9b9-QCBB3hwdYa3UW2U2c9hhrhNzDdPww8Xp6wETWQ&"+linkCode;
		xhr.send(data);
    });
}
function login(onLoginDone){
	var url = "https://production.somtoday.nl/oauth2/token";
	var xhr = new XMLHttpRequest();
	xhr.open("POST", url);
	xhr.setRequestHeader("Accept", "application/json");
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhr.onreadystatechange = function () {
		if (xhr.readyState === 4) {
		    //console.log(xhr.responseText);
			access_token = JSON.parse(xhr.responseText).access_token;
			onLoginDone();
	   }
	};
	var data = "grant_type=password&username=d091c475-43f3-494f-8b1a-84946a5c2142\\"+em+"&password="+pas+"&scope=openid&client_id=D50E0C06-32D1-4B41-A137-A9A850C892C2"//9509466
	xhr.send(data);
}
function saveLogin(email, password){
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
		fs.root.getFile("login.bgi", { create: true, exclusive: false }, function (fileEntry) {
			writeFile(fileEntry, new Blob([email+','+password], { type: 'text/plain' }));
		}, onErrorCreateFile);
	}, onErrorLoadFs);
	em = email;
	pas = password;
}
function loadLogin(afterload){
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
		fs.root.getFile("login.bgi", { create: true, exclusive: false }, function (fileEntry) {
			readFile(fileEntry, function() {
					em = this.result.split(",")[0];
					pas = this.result.split(",")[1];
					afterload();
			});
		}, onErrorCreateFile);
	}, onErrorLoadFs);
}
function writeFile(fileEntry, dataObj) {
    fileEntry.createWriter(function (fileWriter) {
        fileWriter.onwriteend = function() {
            //onwriteend
        };
        fileWriter.onerror = onErrorReadFile;
        fileWriter.write(dataObj);
    });
}
function readFile(fileEntry, onReady) {
    fileEntry.file(function (file) {
        var reader = new FileReader();
        reader.onloadend = onReady;
        reader.readAsText(file);
    }, onErrorReadFile);
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
	
		xhr.send(data);
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
function onErrorCreateFile(){
	alert("create error");
}
function onErrorLoadFs(){
	alert("load sys error");
}
function onErrorReadFile(){
	alert("read error");
}
function onErrorReadFile(e) {
	alert("Failed file write: " + e.toString());
};