var gradeList = {};
var selected = "";
function getGrade() {
	[...document.getElementById("grades").children].forEach((el) => { el.remove(); delete el; });
	t = 0;
	b = 0;
	gradeList[selected].forEach(function (item, index) {
		var gr = document.createElement("p");
		gr.innerText = item[0]+", "+item[1];
		document.getElementById("grades").appendChild(gr);
		t += item[1] * item[0];
		b += item[1];
	});
	answer.innerHTML = "Current average: " + (t / b).toFixed(1);
	gem = ((waarde.value * (b + weging.value * 1) - t) / weging.value).toFixed(1);
	if (gem <= 0)
		answer.innerHTML += "<br>Doesn't matter";
	else if (gem >= 10)
		answer.innerHTML += "<br>Onhaalbaar";
	else
		answer.innerHTML += "<br>Grade to get: " + Math.min(Math.max(((waarde.value * (b + weging.value * 1) - t) / weging.value).toFixed(1), 0), 10);
}
function selectItem(name) {
	selected = name;
	getGrade();
}
function onLoad() {

	document.addEventListener("deviceready", onDeviceReady, false);//Call the deviceready function when corodva is ready.
}
async function onDeviceReady() {//Gets called when corodva is ready.
	//var som = new Somtoday();
	//await som.GetToken("password", "9509466", { "username": Somtoday.LVOBuuid + "\\sj1011103@leerling.sintjan-lvo.nl" })
	var som = new Somtoday();//create a somtoday object
	som.onTokenUpdate = function () {//if a new token is aquierd save it
		var objToSave = { "access_token": som.access_token, "refresh_token": som.refresh_token, "lastRequest": som.lastRequest };//create object to save
		saveSys.SaveJSON(objToSave);//save the object
	};
	saveSys = await SaveSystem.GetFile("settings.spn");
	jsonObj = await saveSys.loadJSON();//function () {//loads the json out of the file (is null if the file is empty or corrupted)
	Object.assign(som, jsonObj);
	var s = await som.GetStudent();
	var num = s.links[0].id;
	var myHeaders = new Headers();
	myHeaders.append("Accept", "application/json");
	myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
	myHeaders.append("Authorization", "Bearer " + som.access_token);
	myHeaders.append("Range", "items=0-999");

	var requestOptions = {
		method: 'GET',
		headers: myHeaders
	};
	var response = await fetch("https://api.somtoday.nl/rest/v1/resultaten/huidigVoorLeerling/" + num, requestOptions);
	var result = await response.json();
	console.log(result);
	result.items.forEach((item) => {
		//if (item.type != "Toetskolom" && item.type != "RapportGemiddeldeKolom" && item.type != "PeriodeGemiddeldeKolom" && item.type != "ToetssoortGemiddeldeKolom" && item.type != "SEGemiddeldeKolom")
		//	console.log(item.type);
		if (item.type == "Toetskolom")
			if (item.resultaat != null) {
				if (gradeList[item.vak.afkorting] == undefined) 
					gradeList[item.vak.afkorting] = [];
				gradeList[item.vak.afkorting].push([parseFloat(item.resultaat), item.weging]);
			}
	});
	Object.keys(gradeList).forEach(function (item) { grid.innerHTML += "<button onClick=\"selectItem(\'" + item + "\');\">" + item + "</button>" });
}