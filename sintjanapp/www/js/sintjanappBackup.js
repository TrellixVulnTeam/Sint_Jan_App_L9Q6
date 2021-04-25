var win;//The current In App Browser Window.
var em = "";//The email of the user.
var pas = "";//The password of the user.
var access_token = "";//The acces token of the user.
var teachers;//
const lvobuuid = "d091c475-43f3-494f-8b1a-84946a5c2142";//The id of lvob school groep.
function onLoad() {//Gets called instantly when app starts.
    document.addEventListener("deviceready", onDeviceReady, false);//Call the deviceready function when corodva is ready.
}
function onDeviceReady() {//Gets called when corodva is ready.
	getTeachers();
	const urlParams = new URLSearchParams(window.location.search);//Gets the paramater in the url. 
	loadLogin(function () {//Tries to get login info from file and call the function when it is done.
		if(urlParams.get('email') != null)//If an email is specified in the paramaters, overwirte the old one.
			em = urlParams.get('email');
		if(urlParams.get('password') != null)//If a password is specified in the paramaters, overwirte the old one.
			pas = urlParams.get('password');
		if(urlParams.get('rem') == "true")//If the login data from the paramaters should be remembered, svae them.
			saveLogin(em,pas);
		login(function (){//try to login and call the function when done.
			showName();//show the users name
			printscedule();//adds the scedule to the end of the document
		});
	});
}
function openApp(packageName, activityName, url){//Tries to open an app. if it fails, launch the website instaid. 
	var sApp = cordova["plugins"]["startApp"].set({//set settings for opening the app
		"action":"ACTION_MAIN",
		"category":"CATEGORY_DEFAULT",
		"type":"text/css",
		"package":packageName,
		"flags":["FLAG_ACTIVITY_CLEAR_TOP","FLAG_ACTIVITY_CLEAR_TASK"],
		"component": [packageName,activityName],
		"intentstart":"startActivity",
	});
	sApp.check(function(values) {//check if app exists
		sApp.start(function() {//if it does start the app
		}, function(error) {//if the app exists but there is still an error alert the user.
			alert(error);
		}, function() {});
	}, function(error) {//if the app doesn't exist open the website
		openPage(url);
	});
}
function openPage(url){//open a page in the In App Browser
	win = cordova.InAppBrowser.open(url,"_blank","location=yes");//Create a new window
	win.addEventListener('loaderror',function(params) {//when the window runs into an error call this function (this happends when you login)
		win.close();//close the window
        var linkCode = "code"+params.url.substring(params.url.indexOf('='),params.url.length);//get the code from the logine
		var xhr = new XMLHttpRequest();//create a request
		var url = "https://somtoday.nl/oauth2/token";//define the target url
		xhr.open("POST", url);//open the request
		xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");//define were the send data resides
		xhr.setRequestHeader("Accept", "application/json");//says it wants json back
		xhr.onreadystatechange = function () {//set the function that gets called when the request is finished
		if (xhr.readyState === 4) {//check if it went ok
			access_token = JSON.parse(xhr.responseText).access_token;//set the new token
			showName();//show the users name on screen
		}};
		var data = "grant_type=authorization_code&"+//define the data to send
				   "client_id=D50E0C06-32D1-4B41-A137-A9A850C892C2&"+
				   //"client_secret=vDdWdKwPNaPCyhCDhaCnNeydyLxSGNJX&"+
				   "redirect_uri=somtodayleerling%3A%2F%2Foauth%2Fcallback&"+
				   "code_verifier=t9b9-QCBB3hwdYa3UW2U2c9hhrhNzDdPww8Xp6wETWQ&"+linkCode;
		xhr.send(data);//send request for a token
    });
}
function login(onLoginDone){//this function gets a token by email and number password
	var url = "https://somtoday.nl/oauth2/token";//define url
	var xhr = new XMLHttpRequest();//create request
	xhr.open("POST", url);//open request
	xhr.setRequestHeader("Accept", "application/json");//says it wants json back
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");//define were the send data resides
	xhr.onreadystatechange = function () {//set the function that gets called when the request is finished
		if (xhr.readyState === 4) {//check if it went ok
			access_token = JSON.parse(xhr.responseText).access_token;//set the new token
			onLoginDone();
	   }
	};
	var data = "grant_type=password&"+//define the data to send
			   "username=d091c475-43f3-494f-8b1a-84946a5c2142\\"+em+
			   "&password="+pas+"&"+
			   "scope=openid&"+
			   "client_id=D50E0C06-32D1-4B41-A137-A9A850C892C2";
	xhr.send(data);//send request for a token
}
function saveLogin(email, password){//saves login data
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {//gets a filesystem object
		fs.root.getFile("login.bgi", { create: true, exclusive: false }, function (fileEntry) {//creates a file object
			writeFile(fileEntry, new Blob([email+','+password], { type: 'text/plain' }));//write to that file
		}, onErrorCreateFile);
	}, onErrorLoadFs);
	em = email;
	pas = password;
}
function loadLogin(afterload){//load login data from file
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {//gets a filesystem object
		fs.root.getFile("login.bgi", { create: true, exclusive: false }, function (fileEntry) {//create file object
			readFile(fileEntry, function() {//read file
					em = this.result.split(",")[0];//sets email
					pas = this.result.split(",")[1];//sets password
					afterload();
			});
		}, onErrorCreateFile);
	}, onErrorLoadFs);
}
function writeFile(fileEntry, dataObj) {//write a file
    fileEntry.createWriter(function (fileWriter) {//create a file writer
        fileWriter.onwriteend = function() {
            //onwriteend
        };
        fileWriter.onerror = onErrorReadFile;
        fileWriter.write(dataObj);//write blob to file
    });
}
function readFile(fileEntry, onReady) {//read a file 
    fileEntry.file(function (file) {//create file object
        var reader = new FileReader();//create file reader
        reader.onloadend = onReady;//calls function when done reading
        reader.readAsText(file);//starts reading
    }, onErrorReadFile);
}
function showName(){//shows the name of the user
	var xhr = new XMLHttpRequest();//create request
	var url = "https://api.somtoday.nl/rest/v1/leerlingen";//define url
	xhr.open("GET", url);//opens get request
	xhr.setRequestHeader("Authorization", 'Bearer '+access_token);//define acces token
	xhr.setRequestHeader("Accept", 'application/json');//says it wants json in return
	xhr.onreadystatechange = function () {//when request is done call function
	if (xhr.readyState === 4) {//if the request went ok
		alert(JSON.parse(xhr.responseText).items[0].roepnaam+" "+JSON.parse(xhr.responseText).items[0].achternaam);//show users name
	}};
	xhr.send();	//send request
}
function printscedule(){//print scedule to html document

	var currentdate = new Date(); //gets date
	var begindate =  currentdate.getFullYear()+"-"+pad(currentdate.getMonth()+1,2)+"-"+pad(currentdate.getDate(),2);
	var enddate =  currentdate.getFullYear()+"-"+pad(currentdate.getMonth()+1,2)+"-"+pad(currentdate.getDate()+1,2);
	var url = "https://api.somtoday.nl/rest/v1/afspraken?sort=asc-id&additional=vak&additional=docentAfkortingen&additional=leerlingen&begindatum="+begindate+"&einddatum="+enddate;//sets url

	var xhr = new XMLHttpRequest();//create request
	xhr.open("GET", url);//opens get request
	xhr.setRequestHeader("Authorization", 'Bearer '+access_token);//define acces token
	xhr.setRequestHeader("Accept", 'application/json');//says it wants json in return
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");//says were the send data is located
	xhr.onreadystatechange = function () {//functiion that gets called when the request is done
	if (xhr.readyState === 4) {//if request went ok
		var obj = JSON.parse(xhr.responseText);//create json object
		for(var i = 0;i<obj.items.length;i++){//for every scedule entry
    		var fullName = obj.items[i].additionalObjects.vak.naam;//gets the name of the subject
			var beginTime = obj.items[i].beginDatumTijd.substring(11,16);//gets the begin time of the subject
			var endTime = obj.items[i].eindDatumTijd.substring(11,16);//gets the end time of the subject
			var enabled = obj.items[i].afspraakStatus == 'ACTIEF';//check if subject is going to happen
			var teacher = obj.items[i].additionalObjects.docentAfkortingen;//get techer code 
			// TODO: get the full name of the teacher using teacher code
			var name = obj.items[i].additionalObjects.vak.afkorting;//get short name of subject
			var location = obj.items[i].locatie;//get location of subject
    		if(enabled){//if subject is going to happen
				var element = document.createElement("p");//create p object (<p></p>)
				element.innerText = fullName+" "+beginTime+" "+endTime+" "+location+" "+teachers[teacher].name+" "+name;//sets text of p element (<p>Wiskunde 10:40 11:30 sa204 lij22 wi</p>)
				document.getElementById("scedule").appendChild(element);//add element to the end of the document
			}
		}
	}};
	xhr.send();//sends request
}
function getTeachers(){
	var xhr = new XMLHttpRequest();//create request
	xhr.open("GET", "https://raw.githubusercontent.com/jktechs/Sint_Jan_App/main/LerarenSintJan.json");//opens get request
	xhr.onreadystatechange = function () {if (xhr.readyState === 4)teachers = JSON.parse(xhr.responseText);};//functiion that gets called when the request is done
	xhr.send();//sends request
}
function som(x){//function to open som
	if(!x)
		openApp("nl.topicus.somtoday.leerling", "nl.topicus.somtoday.leerlinglib.activity.SplashActivity", "https://somtoday.nl/");
	else
		openPage("https://somtoday.nl/");
}
function zermelo(x){//function to open zermelo
	if(!x)
		openApp("nl.zermelo.online.App","nl.zermelo.online.App.MainActivity","https://account.activedirectory.windowsazure.com/applications/signin/40a96122-51bb-430a-b504-6a225c51e676?tenantId=788de26b-bf5a-46d5-bb58-f35ff7bdd172");
	else
		openPage("https://account.activedirectory.windowsazure.com/applications/signin/40a96122-51bb-430a-b504-6a225c51e676?tenantId=788de26b-bf5a-46d5-bb58-f35ff7bdd172");
}
function itslearning(x){//function to open itslearning
	if(!x)
		openApp("com.itslearning.itslearningintapp","itslearning.app.common.ActivityAppStartingPoint","https://lvo.itslearning.com/");
	else
		openPage("https://lvo.itslearning.com/");
}
function onErrorCreateFile(){//when file creation goes wrong
	alert("create error");
}
function onErrorLoadFs(){//when the loading of the filesystem goes wrong
	alert("load sys error");
}
function onErrorReadFile(){//when file reading goes wrong
	alert("read error");
}
function onErrorReadFile(e) {//when file writing goes wrong
	alert("Failed file write: " + e.toString());
}
function pad(num, size) {//padds a number with leading zerros  (4->"04")
    num = num.toString();
    while (num.length < size) num = "0" + num;
    return num;
}