class Somtoday {
    static client_id = "D50E0C06-32D1-4B41-A137-A9A850C892C2"; //static id for student version of somtoday
    static LVOBuuid = "d091c475-43f3-494f-8b1a-84946a5c2142"; //static id for lvob
    static tokenEndpoint = "https://somtoday.nl/oauth2/token"; // endpoint for all token requests
    static baseEndpoint = "https://api.somtoday.nl/rest/v1/";
    constructor() {
      this.email = "";//The email of the user.
      this.password = "";//The password of the user.
      this.access_token = "";//The acces token of the user.
      this.refresh_token = "";//The acces token of the user.
      this.student = null;
      this.scedule = null;
    }
    GetToken(grant_type,grant_value,extra_parm,parse_response){//GetToken("password","9509466","username=d091c475-43f3-494f-8b1a-84946a5c2142\\sj1011103@leerling.sintjan-lvo.nl",null);
	    var xhr = new XMLHttpRequest();//create request
	    xhr.open("POST", Somtoday.tokenEndpoint);//open request
	    xhr.setRequestHeader("Accept", "application/json");//says it wants json back
	    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");//define were the send data resides
        var som = this;
	    xhr.onreadystatechange = function () {//set the function that gets called when the request is finished
		    if (xhr.readyState === 4) {//check if it went ok
                var responseJSON = JSON.parse(xhr.responseText);
			    som.access_token = responseJSON.access_token;//set the new access token
			    som.refresh_token = responseJSON.refresh_token;//set the new refresh token
                if(parse_response != null)
                    parse_response(xhr);
	        }
	    };
	    var data = "grant_type="+grant_type+"&"+//define the data to send
		    	   "scope=openid&"+"&"+
		    	   "client_id="+Somtoday.client_id+"&"+
		    	   grant_type+"="+grant_value+"&"+
                   extra_parm;
	    xhr.send(data);//send request for a token
    }
    GetStudent(parse_response){//shows the name of the user
        var xhr = new XMLHttpRequest();//create request
        var url = Somtoday.baseEndpoint+"leerlingen";//define url
        xhr.open("GET", url);//opens get request
        xhr.setRequestHeader("Authorization", 'Bearer '+this.access_token);//define acces token
        xhr.setRequestHeader("Accept", 'application/json');//says it wants json in return
        var som = this;
        xhr.onreadystatechange = function () {//when request is done call function
            if (xhr.readyState === 4) {//if the request went ok
                som.student = JSON.parse(xhr.responseText).items[0]; 
                if(parse_response != null)
                    parse_response(xhr);
            }
        };
        xhr.send();	//send request
    }
    GetScedule(begindate, enddate, parse_response){//print scedule to html document
        var url = Somtoday.baseEndpoint+"afspraken?sort=asc-id&additional=vak&additional=docentAfkortingen&additional=leerlingen&begindatum="+begindate+"&einddatum="+enddate;//sets url
        var xhr = new XMLHttpRequest();//create request
        xhr.open("GET", url);//opens get request
        xhr.setRequestHeader("Authorization", 'Bearer '+this.access_token);//define acces token
        xhr.setRequestHeader("Accept", 'application/json');//says it wants json in return
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");//says were the send data is located
        var som = this;
        xhr.onreadystatechange = function () {//functiion that gets called when the request is done
        if (xhr.readyState === 4) {//if request went ok
            som.scedule = JSON.parse(xhr.responseText).items;//create json object
            if(parse_response != null)
                parse_response(xhr);
        }};
        xhr.send();//sends request
    }
}