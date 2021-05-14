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
        this.lastRequest = 0;
        this.student = null;
        this.scedule = null;
        this.onTokenUpdate = null;
    }
    CheckAccessToken() {//check if access_token or refresh_token has expierd
        var som = this;//create refference to this som object (the this variable gets replaced when entering a function)
        return new Promise((resolve, reject) => {
            var time = new Date().getTime() / 100 - this.lastRequest;
            if (time > 3600) {
                if (time > 1296000) {
                    this.GetToken("password", this.password, "username=" + Somtoday.LVOBuuid + "\\" + this.email).then(resolve());
                    alert("thread stop because token is expired");//both have expired
                    reject();
                } else
                    this.GetToken("refresh_token", this.refresh_token, "").then(resolve);//access_token has expired use refresh_token to get a new one
            } else
                resolve(som.access_token);//none have expired so return
        });
    }
    GetToken(grant_type, grant_value, extra_parm) {//get token via refresh or password
        var som = this;//create refference to this som object (the this variable gets replaced when entering a function)
        return new Promise((resolve, reject) => {
            var xhr = new XMLHttpRequest();//create request
            xhr.open("POST", Somtoday.tokenEndpoint);//open request
            xhr.setRequestHeader("Accept", "application/json");//says it wants json back
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");//define were the send data resides
            xhr.onreadystatechange = function () {//set the function that gets called when the request is finished
                if (xhr.readyState === 4) {//check if it went ok
                    som.lastRequest = new Date().getTime() / 100;//set the current time
                    var responseJSON = JSON.parse(xhr.responseText);//parse the json
                    som.access_token = responseJSON.access_token;//set the new access token
                    som.refresh_token = responseJSON.refresh_token;//set the new refresh token
                    if (som.onTokenUpdate != null)
                        som.onTokenUpdate();//save new token to file
                    resolve(som.access_token);//return the token
                }
            };
            var data = "grant_type=" + grant_type + "&" +//define the data to send
                "scope=openid&" + "&" +
                "client_id=" + Somtoday.client_id + "&" +
                grant_type + "=" + grant_value + (extra_parm != "" ? "&" : "") +
                extra_parm;
            xhr.send(data);//send request for a token
        });
    }
    GetAuthToken(linkCode) {
        var som = this;//create refference to this som object (the this variable gets replaced when entering a function)
        return new Promise((resolve, reject) => {
            var xhr = new XMLHttpRequest();//create a request
            xhr.open("POST", Somtoday.tokenEndpoint);//open the request
            xhr.setRequestHeader("Accept", "application/json");//says it wants json back
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");//define were the send data resides
            xhr.onreadystatechange = function () {//set the function that gets called when the request is finished
                if (xhr.readyState === 4) {//check if it went ok
                    som.lastRequest = new Date().getTime() / 100;//set the current time
                    var responseJSON = JSON.parse(xhr.responseText);//parse the json
                    som.access_token = responseJSON.access_token;//set the new access token
                    som.refresh_token = responseJSON.refresh_token;//set the new refresh token
                    som.onTokenUpdate();//save new token to file
                    resolve(som.access_token);//return the token
                }
            };
            var data = "grant_type=authorization_code&" +//define the data to send
                "client_id=D50E0C06-32D1-4B41-A137-A9A850C892C2&" +
                "redirect_uri=somtodayleerling%3A%2F%2Foauth%2Fcallback&" +
                "code_verifier=t9b9-QCBB3hwdYa3UW2U2c9hhrhNzDdPww8Xp6wETWQ&" + linkCode;
            xhr.send(data);//send request for a token
        });
    }
    GetStudent() {//gets user data
        var som = this;//create refference to this som object (the this variable gets replaced when entering a function)
        return new Promise((resolve, reject) => {
            this.CheckAccessToken().then(() => {//check token
                var xhr = new XMLHttpRequest();//create request
                xhr.open("GET", Somtoday.baseEndpoint + "leerlingen");//opens get request
                xhr.setRequestHeader("Authorization", 'Bearer ' + som.access_token);//define acces token
                xhr.setRequestHeader("Accept", 'application/json');//says it wants json in return
                xhr.onreadystatechange = function () {//when request is done call function
                    if (xhr.readyState === 4) {//if the request went ok
                        som.student = JSON.parse(xhr.responseText).items[0];//parse student json and store it in this object
                        resolve(som.student);
                    }
                };
                xhr.send();	//send request
            });
        });
    }
    GetScedule(begindate, enddate) {//gets the scedule between two dates
        var som = this;//create refference to this som object (the this variable gets replaced when entering a function)
        return new Promise((resolve, reject) => {
            this.CheckAccessToken().then(() => {//check token
                var url = Somtoday.baseEndpoint + "afspraken?sort=asc-id&additional=vak&additional=docentAfkortingen&additional=leerlingen&begindatum=" + begindate + "&einddatum=" + enddate;//sets url
                var xhr = new XMLHttpRequest();//create request
                xhr.open("GET", url);//opens get request
                xhr.setRequestHeader("Authorization", 'Bearer ' + som.access_token);//define acces token
                xhr.setRequestHeader("Accept", 'application/json');//says it wants json in return
                xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");//says were the send data is located
                xhr.onreadystatechange = function () {//functiion that gets called when the request is done
                    if (xhr.readyState === 4) {//if request went ok
                        som.scedule = JSON.parse(xhr.responseText).items;//parse scedule json and store it in this object
                        resolve(som.scedule);
                    }
                };
                xhr.send();//sends request
            });
        });
    }
}