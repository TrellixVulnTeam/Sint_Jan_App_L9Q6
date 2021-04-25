var win;//The current In App Browser Window.
var som;
var saveSys;
var teachers;
var appDict =	{
					"somtoday":{
						"uri":"nl.topicus.somtoday.leerling",
						"url":"https://somtoday.nl/",
				 		"activity":"nl.topicus.somtoday.leerlinglib.activity.SplashActivity"
					},
					"zermelo":{
						"uri":"nl.zermelo.online.App",
						"url":"https://account.activedirectory.windowsazure.com/applications/signin/40a96122-51bb-430a-b504-6a225c51e676?tenantId=788de26b-bf5a-46d5-bb58-f35ff7bdd172",
				 		"activity":"nl.zermelo.online.App.MainActivity"
					},
					"itslearning":{
						"uri":"com.itslearning.itslearningintapp",
						"url":"https://lvo.itslearning.com/",
				 		"activity":"itslearning.app.common.ActivityAppStartingPoint"
					}
				};
function onLoad() {//Gets called instantly when app starts.
	window.onerror = function(msg, url, line, col, error) {
		alert(!error ? '' : 'error: ' + error + " line: " + line);
		return true;//supres error
	};
    document.addEventListener("deviceready", onDeviceReady, false);//Call the deviceready function when corodva is ready.
}
function onDeviceReady() {//Gets called when corodva is ready.
	var xhr = new XMLHttpRequest();//create request
	xhr.open("GET", "https://raw.githubusercontent.com/jktechs/Sint_Jan_App/main/LerarenSintJan.json");//opens get request
	xhr.onreadystatechange = function () {if (xhr.readyState === 4)teachers = JSON.parse(xhr.responseText);};//functiion that gets called when the request is done
	xhr.send();//sends request
	som = new Somtoday();
	som.onTokenUpdate = function(){
		var objToSave = {"password":som.password,"email":som.email,"access_token":som.access_token,"refresh_token":som.refresh_token,"lastRequest":som.lastRequest};
		saveSys.SaveJSON(objToSave,function(){},onErrorWriteFile);
	};
	saveSys = new SaveSystem("settings.spn",function(){
		saveSys.loadJSON(function(jsonObj){
			if(jsonObj != null){
				som.email = jsonObj.email;
				som.password = jsonObj.password;
				som.access_token = jsonObj.access_token;
				som.refresh_token = jsonObj.refresh_token;
				som.lastRequest = jsonObj.lastRequest;
			}
			const urlParams = new URLSearchParams(window.location.search);//Gets the paramater in the url.
			var email = urlParams.get('email');
			var password = urlParams.get('password');
			var save = urlParams.get('save');
			if(email != null)//If an email is specified in the paramaters, overwirte the old one.
				som.email = urlParams.get('email');
			if(password != null)//If a password is specified in the paramaters, overwirte the old one.
				som.password = urlParams.get('password');
			if(save == "true"){//If the login data from the paramaters should be remembered, svae them.
				var objToSave = {"password":som.password,"email":som.email,"access_token":som.access_token,"refresh_token":som.refresh_token,"lastRequest":som.lastRequest};
				saveSys.SaveJSON(objToSave,function(){},onErrorWriteFile);
			}
			showName();
			printscedule();
		},onErrorReadFile);
	},onErrorCreateFile,onErrorLoadFs);
}
function showName(){//shows the name of the user
	som.GetStudent(function(student){
		alert(student.roepnaam+" "+som.student.achternaam);
	});
}
function printscedule(){//print scedule to html document
	var currentdate = new Date(); //gets date
	var begindate =  currentdate.getFullYear()+"-"+pad(currentdate.getMonth()+1,2)+"-"+pad(currentdate.getDate(),2);
	var enddate =  currentdate.getFullYear()+"-"+pad(currentdate.getMonth()+1,2)+"-"+pad(currentdate.getDate()+1,2);

	som.GetScedule(begindate, enddate, function(scedule){
		for(var i = 0;i<scedule.length;i++){//for every scedule entry
    		var fullName = scedule[i].additionalObjects.vak.naam;//gets the name of the subject
			var beginTime = scedule[i].beginDatumTijd.substring(11,16);//gets the begin time of the subject
			var endTime = scedule[i].eindDatumTijd.substring(11,16);//gets the end time of the subject
			var enabled = scedule[i].afspraakStatus == 'ACTIEF';//check if subject is going to happen
			var teacher = scedule[i].additionalObjects.docentAfkortingen;//get techer code
			var name = scedule[i].additionalObjects.vak.afkorting;//get short name of subject
			var location = scedule[i].locatie;//get location of subject
    		if(enabled){//if subject is going to happen
				var element = document.createElement("p");//create p object (<p></p>)
				element.innerText = fullName+" "+beginTime+" "+endTime+" "+location+" "+teachers[teacher].name+" "+name;//sets text of p element (<p>Wiskunde 10:40 11:30 sa204 lij22 wi</p>)
				document.getElementById("scedule").appendChild(element);//add element to the end of the document
			}
		}
	});
}
function openPage(url){//open a page in the In App Browser
	win = cordova.InAppBrowser.open(url,"_blank","location=yes");//Create a new window
	win.addEventListener('loaderror',function(params) {//when the window runs into an error call this function (this happends when you login)
		win.close();//close the window
        var linkCode = "code"+params.url.substring(params.url.indexOf('='),params.url.length);//get the code from the logine
		som.GetAuthToken(linkCode,function(xhr){showName();printscedule();});
    });
}
function openApplication(app,forceWebsite){
	if(!forceWebsite){
		var sApp = cordova["plugins"]["startApp"].set({//set settings for opening the app
			"action":"ACTION_MAIN",
			"category":"CATEGORY_DEFAULT",
			"type":"text/css",
			"package":app.uri,
			"flags":["FLAG_ACTIVITY_CLEAR_TOP","FLAG_ACTIVITY_CLEAR_TASK"],
			"component": [app.uri,app.activity],
			"intentstart":"startActivity",
		});
		sApp.check(function(values) {//check if app exists
			sApp.start(function() {//if it does start the app
			}, function(error) {//if the app exists but there is still an error alert the user.
				alert(error);
			}, function() {});
		}, function(error) {//if the app doesn't exist open the website
			openPage(app.url);
		});
	} else {
		openPage(app.url);
	}
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
function onErrorWriteFile(e) {//when file writing goes wrong
	alert("Failed file write: " + e.toString());
}
function pad(num, size) {//padds a number with leading zerros  (4->"04")
    num = num.toString();
    while (num.length < size) num = "0" + num;
    return num;
}