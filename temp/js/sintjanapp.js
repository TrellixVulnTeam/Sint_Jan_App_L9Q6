lvoId = "d091c475-43f3-494f-8b1a-84946a5c2142";
lastTime = 0;
accesCode = "";
baseurl = "";
name = "";
studentId = 0;
gradeList = {};
selected = "";
var xhr;
function getGrade(){
	t = 0;
	b = 0;
	gradeList[selected].forEach(function (item, index) {
		t += item[1]*item[0];
		b += item[1];
	});
	answer.innerHTML = "Current average: "+(t/b).toFixed(1);
	gem = ((waarde.value*(b+weging.value*1)-t)/weging.value).toFixed(1);
	if(gem<=0)
		answer.innerHTML += "<br>Doesn't matter";
	else if(gem>=10)
		answer.innerHTML += "<br>Onhaalbaar";
	else
		answer.innerHTML += "<br>Grade to get: "+Math.min(Math.max(((waarde.value*(b+weging.value*1)-t)/weging.value).toFixed(1), 0), 10);
}
function getGrades(){
	xhr.open("GET",baseurl+"/rest/v1/resultaten/huidigVoorLeerling/"+studentId);
	xhr.setRequestHeader("Accept", "application/json");
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhr.setRequestHeader("Authorization", "Bearer "+accesCode);
	xhr.setRequestHeader("Range", "items=0-999");
	xhr.onreadystatechange = function () {
	if (xhr.readyState === 4) {	
		grades = JSON.parse(xhr.response).items;
		grades.forEach(checkGrade);
		
		console.log(gradeList);
		Object.keys(gradeList).forEach(function (item, index) {grid.innerHTML += "<button onClick=\"selectItem(\'"+item+"\');\">"+item+"</button>"});
	}};
	xhr.send();
}
function selectItem(name){
	selected = name;
	getGrade();
}
function checkGrade(item, index) {
	if(item.type=="Toetskolom"){
		if(gradeList[item.vak.afkorting]==undefined)
			gradeList[item.vak.afkorting] = [];
		gradeList[item.vak.afkorting].push([parseFloat(item.resultaat.replace(",", ".")),item.weging]);
	}
} 
function login(){
	//     'grant_type':   'password',
    //     'username':      lvoId+'\\'+'sj1011103@leerling.sintjan-lvo.nl',
    //     'password':     '9509466',
    //     'scope':        'openid',
    //     'client_id':    'D50E0C06-32D1-4B41-A137-A9A850C892C2',
    //     'client_secret':'vDdWdKwPNaPCyhCDhaCnNeydyLxSGNJX'};
	xhr.open("POST", "https://production.somtoday.nl/oauth2/token");
	xhr.setRequestHeader("Accept", "application/json");
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
	    accesCode = JSON.parse(xhr.response).access_token;
		baseurl = JSON.parse(xhr.response).somtoday_api_url;
	    var d = new Date();
	    lastTime = d.getTime();
		
		xhr.open("GET",baseurl+"/rest/v1/leerlingen");
		xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		xhr.setRequestHeader("Accept", "application/json");
		xhr.setRequestHeader("Authorization", "Bearer "+accesCode);
		xhr.onreadystatechange = function () {
		if (xhr.readyState === 4) {
			StudentData = JSON.parse(xhr.response).items[0];
			name = StudentData.roepnaam+' '+StudentData.achternaam;
			studentId = StudentData.links[0].id;			
			getGrades();
		}};
		xhr.send();
    }};
   	stringData = "grant_type=password&username="+lvoId+'\\'+email.value+'&password='+password.value+'&scope=openid&client_id=D50E0C06-32D1-4B41-A137-A9A850C892C2&client_secret=vDdWdKwPNaPCyhCDhaCnNeydyLxSGNJX';
	xhr.send(stringData);
}
function onLoad(){
	xhr = new XMLHttpRequest();
}
function getTimeLeft(){
	return 3600-(new Date().getTime()-lastTime)/1000;
}