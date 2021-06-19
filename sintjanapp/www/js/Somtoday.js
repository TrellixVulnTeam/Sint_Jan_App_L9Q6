class Somtoday {
    static client_id = "D50E0C06-32D1-4B41-A137-A9A850C892C2"; //static id for student version of somtoday
    static LVOBuuid = "d091c475-43f3-494f-8b1a-84946a5c2142"; //static id for lvob
    static tokenEndpoint = "https://somtoday.nl/oauth2/token"; // endpoint for all token requests
    static baseEndpoint = "https://api.somtoday.nl/rest/v1/"; // endpoint for all other requests
    constructor() {
        this.access_token = "";//The acces token of the user.
        this.refresh_token = "";//The refresh acces token of the user.
        this.lastRequest = 0; //seconds from jan 1 1970 to when the last token was aquierd
        this.student = null; //a buffer for student data
    }
    CheckAccessToken() {//check if access_token or refresh_token has expierd
        var som = this;//create refference to this som object (the this variable "this" gets replaced when entering a function)
        return new Promise((resolve, reject) => {
            var time = new Date().getTime() / 100 - this.lastRequest; // get time from now to when the last token was aquierd
            if (time > 3600) {//if normal token if exipiered
                if (time > 1296000) {//if all tokens are expirerd
                    alert("thread stop because token is expired");
                    reject("no valid token");
                } else//when only the normal token is expired
                    this.GetToken("refresh_token", this.refresh_token).then(resolve).catch(reject);//use refresh_token to get a new access token and then return it
            } else//if none have expiered return token
                resolve(som.access_token);
        });
    }
    GetToken(grant_type, grant_value, extra_parms) {//get token via refresh or password grand type
        return new Promise((resolve, reject) => {
            var urlencoded = new URLSearchParams();
            urlencoded.append("grant_type", grant_type);
            urlencoded.append(grant_type, grant_value);
            urlencoded.append("scope", "openid");
            urlencoded.append("client_id", Somtoday.client_id);
            if (extra_parms != null)
                for (var extra_name in extra_parms)
                    urlencoded.append(extra_name, extra_parms[extra_name]);

            var requestOptions = {
                method: 'POST',
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: urlencoded,
            };
            console.log(requestOptions);
            fetch(Somtoday.tokenEndpoint, requestOptions)
                .then(response => response.json())
                .then(result => {
                    this.lastRequest = new Date().getTime() / 100;//set the current time
                    this.access_token = result.access_token;//set the new access token
                    this.refresh_token = result.refresh_token;//set the new refresh token
                    if (this.onTokenUpdate != null)
                        this.onTokenUpdate();//save new token
                    resolve(this.access_token);//return the token
                }).catch(reject);
        });
    }
    GetStudent() {//gets user data
        return new Promise((resolve, reject) => {
            this.CheckAccessToken().then(() => {//check token
                var myHeaders = new Headers();
                myHeaders.append("Authorization", "Bearer " + this.access_token);
                myHeaders.append("Accept", "application/json");
                var requestOptions = {
                    method: 'GET',
                    headers: myHeaders,
                };
                fetch(Somtoday.baseEndpoint + "leerlingen", requestOptions)
                    .then(response => response.json())
                    .then(result => resolve(result.items[0]))
                    .catch(reject);
            }).catch(reject);
        });
    }
    GetScedule(begindate, enddate) {//gets the scedule between two dates
        return new Promise((resolve, reject) => {
            this.CheckAccessToken().then(() => {//check token
                var myHeaders = new Headers();
                myHeaders.append("Authorization", "Bearer " + this.access_token);
                myHeaders.append("Accept", "application/json");
                var requestOptions = {
                    method: 'GET',
                    headers: myHeaders,
                };
                fetch(Somtoday.baseEndpoint + "afspraken?sort=asc-id&additional=vak&additional=docentAfkortingen&additional=leerlingen&begindatum=" + begindate + "&einddatum=" + enddate, requestOptions)
                    .then(response => response.json())
                    .then(result => resolve(result.items))
                    .catch(reject);
            }).catch(reject);
        });
    }
}