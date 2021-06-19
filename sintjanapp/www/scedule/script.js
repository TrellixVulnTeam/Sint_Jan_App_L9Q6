var win;//the current In App Browser Window.
var som;//the current somtoday object
var saveSys;//the current save file
var teachers;//stores all teacher names
var weekOffset = 0;
var dissable = false;

var elementBuffer = [[], [], []];
var dataBuffer = [[], [], []];

const monthNames = ["January", "February", "March", "April", "May", "June",
	"July", "August", "September", "October", "November", "December"
];

function onLoad() {//Gets called instantly when app starts.
	window.onresize = function () {
		var div = document.getElementById("scedule");
		div.style.paddingTop = document.getElementById("date").clientHeight + "px";
		var newWidth = document.getElementById("firstHoure").clientWidth;
		div = document.getElementById("dateTable");
		div.style.marginLeft = newWidth + "px";
		div.style.width = "calc(100% - " + newWidth + "px)";
	}
	window.onresize();
	fetch("https://raw.githubusercontent.com/jktechs/Sint_Jan_App/main/LerarenSintJan.json").then((v) => { v.json().then((o) => { teachers = o }) });
	window.onerror = function (msg, url, line, col, error) {//handels all errors and alerts the user
		alert(!error ? '' : 'error: ' + error + " line: " + line + " url: " + url + " msg: " + msg);//the error object is null somtimes
		return true;//supres other error messages
	};
	var swipeSettings = {
		startSlide: 1,
		speed: 200,
		draggable: true,
		continuous: true,
		disableScroll: false,
		stopPropagation: false,
		ignore: ".scroller",
		callback: function (index, elem, dir) { },
		transitionEnd: async function (index, elem) {
			weekOffset += (index - 1) * 1000 * 3600 * 24 * 7;
			for (var i = 0; i < 7; i++) {
				var currentTime = new Date().getTime() + weekOffset;
				var currentDate = new Date(currentTime); //gets date
				var firstday = new Date(new Date(new Date(currentTime).setDate(currentDate.getDate() - currentDate.getDay() + 1)).setHours(0));
				firstday.setTime(firstday.getTime() + i * 24 * 3600 * 1000);
				document.getElementById("dn" + (i + 1)).innerText = firstday.getDate();
				document.getElementById("mn" + (i + 1)).innerText = monthNames[firstday.getMonth()];
			}
			if (index != 1) {
				getscedule().then(() => {
					while (elementBuffer[1].length > 0) { var v = elementBuffer[1].pop(); v.remove(); delete v; }
					printscedule(1);
					window.mySwipe.kill();
					delete window.mySwipe;
					window.mySwipe = new Swipe(document.getElementById('slider'), swipeSettings);
					while (elementBuffer[0].length > 0) { var v = elementBuffer[0].pop(); v.remove(); delete v; }
					while (elementBuffer[2].length > 0) { var v = elementBuffer[2].pop(); v.remove(); delete v; }
					printscedule(0);
					printscedule(2);
				}).catch(e => alert(e));
			}
		}
	};
	window.mySwipe = new Swipe(document.getElementById('slider'), swipeSettings);
	document.addEventListener("deviceready", onDeviceReady, false);//Call the deviceready function when corodva is ready.
}
async function onDeviceReady() {//Gets called when corodva is ready.
	som = new Somtoday();//create a somtoday object
	som.onTokenUpdate = function () {//if a new token is aquierd save it
		var objToSave = { "access_token": som.access_token, "refresh_token": som.refresh_token, "lastRequest": som.lastRequest };//create object to save
		saveSys.SaveJSON(objToSave);//save the object
	};
	saveSys = await SaveSystem.GetFile("settings.spn");
	jsonObj = await saveSys.loadJSON();//function () {//loads the json out of the file (is null if the file is empty or corrupted)
	Object.assign(som, jsonObj);
	getscedule().then(() => {
		printscedule(0);
		printscedule(1);
		printscedule(2);
	}).catch(e => alert(e));
	
}
async function getscedule() {
	dataBuffer = [[], [], []];
	var currentTime = new Date().getTime() + weekOffset;
	var currentDate = new Date(currentTime); //gets date
	var firstday = new Date(new Date(new Date(currentTime).setDate(currentDate.getDate() - currentDate.getDay() - 6)).setHours(0));
	var lastday = new Date(new Date(new Date(currentTime).setDate(currentDate.getDate() - currentDate.getDay() + 15)).setHours(0));
	var begindate = firstday.getFullYear() + "-" + pad(firstday.getMonth() + 1, 2) + "-" + pad(firstday.getDate(), 2);
	var enddate = lastday.getFullYear() + "-" + pad(lastday.getMonth() + 1, 2) + "-" + pad(lastday.getDate(), 2);
	var scedule = await som.GetScedule(begindate, enddate);//gets scedule object
	for (var i = 0; i < scedule.length; i++) {//for every scedule entry
		var beginTime = new Date(scedule[i].beginDatumTijd);//gets the begin time of the subject
		var weekNum = Math.floor((beginTime - firstday) / 3600 / 24 / 7 / 1000);
		console.log(beginTime + " " + weekNum);
		dataBuffer[weekNum].push(scedule[i]);
	}
}
function printscedule(week) {//print scedule to html document
	var idkOffset = 120;
	var timeOffset = 60*8 + 30;
	for (var i = 0; i < dataBuffer[week].length; i++) {//for every scedule entry
		var enabled = dataBuffer[week][i].afspraakStatus == 'ACTIEF';//check if subject is going to happen
		if (enabled) {//if subject is going to happen
			var fullName = dataBuffer[week][i].additionalObjects.vak.naam;//gets the name of the subject
			var teacher = dataBuffer[week][i].additionalObjects.docentAfkortingen;//get techer code
			var beginTime = new Date(dataBuffer[week][i].beginDatumTijd);//gets the begin time of the subject
			var endTime = new Date(dataBuffer[week][i].eindDatumTijd);//gets the end time of the subject
			var name = dataBuffer[week][i].additionalObjects.vak.afkorting;//get short name of subject
			var location = dataBuffer[week][i].locatie;//get location of subject
			var startMin = beginTime.getHours() * 60 + beginTime.getMinutes() - timeOffset;
			var length = endTime.getHours() * 60 + endTime.getMinutes() - startMin - timeOffset;
			var slideObj = null;
			if (week == 0)
				slideObj = document.getElementById("firstBuffer");
			if (week == 1)
				slideObj = document.getElementById("innerScedule");
			if (week == 2)
				slideObj = document.getElementById("lastBuffer");
			var block = addBlock(beginTime.getDay() - 1, startMin + idkOffset, length, name, location, slideObj);//teachers[teacher].name
			elementBuffer[week].push(block);
		}
	}
}
function addBlock(x, y, l, subjectName, location, slide) {
	var sceduleHeightPerMinute = document.getElementById("firstHoure").clientHeight / 50;
	var newWidth = document.getElementById("firstHoure").clientWidth;
	//var div1 = document.getElementById("date");
	var block = document.createElement("block");
	block.className = "block";
	var nameText = document.createElement("p");
	nameText.innerText = subjectName;
	var locationText = document.createElement("p");
	locationText.innerText = location;
	block.append(nameText);
	block.append(locationText);
	var fullWidth = document.body.scrollWidth;
	block.style.left = newWidth + x * (fullWidth - newWidth) / 7 + "px";
	block.style.width = (fullWidth - newWidth) / 7 + "px";
	block.style.top = sceduleHeightPerMinute * y + "px";
	block.style.height = sceduleHeightPerMinute * l + "px";
	slide.append(block);
	return block;
}
function pad(num, size) {//padds a number with leading zerros  (4 => "04")
	num = num.toString();
	while (num.length < size) num = "0" + num;
	return num;
}