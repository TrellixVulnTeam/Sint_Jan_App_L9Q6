var Somtoday = {}
Somtoday.client_id = "D50E0C06-32D1-4B41-A137-A9A850C892C2"; //static id for student version of somtoday
Somtoday.LVOBuuid = "d091c475-43f3-494f-8b1a-84946a5c2142"; //static id for lvob
Somtoday.tokenEndpoint = "https://inloggen.somtoday.nl/oauth2/token"; // endpoint for all token requests
Somtoday.baseEndpoint = "https://api.somtoday.nl/rest/v1/"; // endpoint for all other requests
var pad = (num, size) => {//padds a number with leading zerros  (4 => "04")
    num = num.toString();
    while (num.length < size) num = "0" + num;
    return num;
}
var post = async (link, data, header) => {
    if(typeof cordovaHTTP == "undefined") throw "cordovaHTTP not found";
    return new Promise((resolve, reject) => {
        cordovaHTTP.post(link, data, header, function (response) {
            try{
                response.data = JSON.parse(response.data);
                resolve(response.data);
            } catch(e){reject(e);}
        }, function (response) {
            reject("err2: " + response.status + " "+link);
        });
    });
}
var get = async (link, header) => {
    if(typeof cordovaHTTP == "undefined") throw "cordovaHTTP not found";
    return new Promise((resolve, reject) => {
        cordovaHTTP.get(link, {}, header, function (response) {
            try{
                response.data = JSON.parse(response.data);
                resolve(response.data);
            }catch(e){reject(e);}
        }, function (response) {
            reject("err1: " + response.status + " "+link);
        });
    });
}
Somtoday.CheckAccessToken = async (somObj) => {
    if (!(new Date().getTime() < somObj.access_token_expire_time)) {
        if (!(new Date().getTime() < somObj.refresh_token_expire_time)) {
            throw "Error: No valid token.";
        } else
            return await Somtoday.GetToken(somObj, "refresh_token", somObj.refresh_token);
    } else
        return somObj.access_token;
}
Somtoday.GetToken = async (somObj, grant_type, grant_value, extra_parms) => {//get token via refresh or password grand type
    var urlencoded = {
        "grant_type": grant_type,
        "scope": "openid",
        "client_id": Somtoday.client_id
    };
    urlencoded[grant_type] = grant_value;
    if (extra_parms != null)
        for (var extra_name in extra_parms)
            urlencoded[extra_name] = extra_parms[extra_name];
    var result = await post(Somtoday.tokenEndpoint, urlencoded, { "Content-Type": "application/x-www-form-urlencoded" });
    somObj.access_token = result.access_token
    somObj.access_token_expire_time = 3600 * 1000 + new Date().getTime()
    somObj.refresh_token = result.refresh_token
    somObj.refresh_token_expire_time = 1296000 * 1000 + new Date().getTime()
    if (somObj.onTokenUpdate != null)
        somObj.onTokenUpdate();//save new token
    return somObj.access_token;//return the token
}
Somtoday.getPasswordToken = async (somObj, username, password) => {
    return await Somtoday.GetToken(somObj, "password", password, { "username": Somtoday.LVOBuuid + "\\" + username });
}
Somtoday.GetStudent = async (somObj) => {//gets user data
    await Somtoday.CheckAccessToken(somObj);
    return await get(Somtoday.baseEndpoint + "leerlingen", { "Authorization": "Bearer " + somObj.access_token, "Accept": "application/json" });
}
Somtoday.GetScedule = async (somObj, firstday, lastday) => {//gets the scedule between two dates
    await Somtoday.CheckAccessToken(somObj);
    var begindate = firstday.getFullYear() + "-" + this.pad(firstday.getMonth() + 1, 2) + "-" + this.pad(firstday.getDate(), 2);
    var enddate = lastday.getFullYear() + "-" + this.pad(lastday.getMonth() + 1, 2) + "-" + this.pad(lastday.getDate(), 2);
    var link = Somtoday.baseEndpoint + "afspraken?sort=asc-id&additional=vak&additional=docentAfkortingen&additional=leerlingen&begindatum=" + begindate + "&einddatum=" + enddate;
    return await get(link, { "Authorization": "Bearer " + somObj.access_token, "Accept": "application/json" })
}
Somtoday.GetGrades = async (somObj, userId) => {//gets the scedule between two dates
    await Somtoday.CheckAccessToken(somObj);
    var link = Somtoday.baseEndpoint + "resultaten/huidigVoorLeerling/" + userId;
    var grades = await get(link, { "Authorization": "Bearer " + somObj.access_token, "Accept": "application/json",'Range':'items=0-600' });
    var gradeDict = {};
    for (var i = 0; i < grades.items.length; i++) {
        var grade = grades.items[i];
        if(gradeDict.hasOwnProperty(grade.vak.naam)){
            gradeDict[grade.vak.naam].push(grade);
        } else {
            gradeDict[grade.vak.naam] = [grade];
        }
    }
    return gradeDict;
}