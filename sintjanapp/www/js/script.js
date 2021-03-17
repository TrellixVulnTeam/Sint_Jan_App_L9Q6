let pag = new URLSearchParams(window.location.search).get('page');
if(!pag)
pag = 0;
let day = new URLSearchParams(window.location.search).get('day');
if(!day)
day = 0;
function curday(sp, off){
	today = new Date();
	today.setDate(today.getDate() + off);
	var dd = today.getDate();
	var mm = today.getMonth()+1;
	var yyyy = today.getFullYear();

	if(dd<10) dd='0'+dd;
	if(mm<10) mm='0'+mm;
	return (mm+sp+dd+sp+yyyy);
};
function Ready(){
	document.getElementById("menubar").children[pag].children[0].className = "active";
	for(let i = 0;i<document.getElementById("menubar").childElementCount;i++){
		document.getElementById("menubar").children[i].children[0].href = "?page="+i+"&day="+day;
	}
	logo = "<img style='width:20vh;padding:0px 5vw 0px 5vw;' src='img/logosintjan.svg' alt='Logo Sint-Janscollege'>";
	if(pag == 1){
		document.getElementById("header").innerHTML = logo+"Huiswerk"
	} else if(pag == 0) {
		document.getElementById("header").innerHTML = logo+"<a href='?day="+(parseInt(day)-1)+"&page="+pag+"'> < </a>Datum: "+curday("/",parseInt(day))+"<a href='?day="+(parseInt(day)+1)+"&page="+pag+"'> > </a>"
	} else if(pag == 2) {
		document.getElementById("header").innerHTML = logo+"Instellingen"
	} else if(pag == 3) {
		document.getElementById("header").innerHTML = logo+"Over"
	}
	let lines = []
	if(pag==0)
		lines = ["Vak Naam","Huiswerk titel","[xx:xx-xx:xx]","hier staat meer uitleg over het huiswek",10];
	else if(pag==1)
		lines = ["Huiswerk titel","vak","[xx/xx/xxxx xx:xx-xx:xx]","uitleg",10];
	else if(pag==2)
		lines = ["Programma naam","Username:xxxxxxx","","Password:xxxxxxx",2];
	else if(pag==3)
		lines = ["Credits","","Programmatuur: Jannick Koppe, Mathijs Janssen, Dean Hollender","<a href='https://icons8.com/icon/364/settings'>Settings icon by Icons8</a><br><a href='https://icons8.com/icon/49602/grid'>Grid icon by Icons8</a><br><a href='https://icons8.com/icon/77/info'>Info icon by Icons8</a><br><a href='https://icons8.com/icon/RCh2z2b7aAVV/homework'>Homework icon by Icons8</a>",1];
	for(let k = 0;k<lines[4];k++){
		data = document.getElementById("dataHolder");
		div = document.createElement('div');
		data.appendChild(div);
		div.className = "LessonItem w3-cell-row"
		for(let i = 0;i<2;i++){
			div2 = document.createElement('div');
			div.appendChild(div2);
			div2.className = "LessonLine w3-cell";
			div2.style = "width:75%;height:12%;margin:0 auto;";
			for(let j = 0;j<2;j++){
				span = document.createElement('span');
				div2.appendChild(span);
				span.innerHTML = lines[j+i*2];
			}
		}
		hr = document.createElement('hr');
		div.appendChild(hr);
	}
}
