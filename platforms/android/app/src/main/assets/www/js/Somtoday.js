var Somtoday = {}
Somtoday.client_id = "D50E0C06-32D1-4B41-A137-A9A850C892C2"; //static id for student version of somtoday
Somtoday.LVOBuuid = "d091c475-43f3-494f-8b1a-84946a5c2142"; //static id for lvob
Somtoday.tokenEndpoint = "https://inloggen.somtoday.nl/oauth2/token"; // endpoint for all token requests
Somtoday.baseEndpoint = "https://api.somtoday.nl/rest/v1/"; // endpoint for all other requests
Somtoday.loginLink = "https://somtoday.nl/oauth2/authorize?redirect_uri=somtodayleerling://oauth/callback&client_id=D50E0C06-32D1-4B41-A137-A9A850C892C2&response_type=code&prompt=login&state=UNlYiXONB69K8uNwNJ2rCw&scope=openid&code_challenge=tCqjy6FPb1kdOfvSa43D8a7j8FLDmKFCAz8EdRGdtQA&code_challenge_method=S256&tenant_uuid=788de26b-bf5a-46d5-bb58-f35ff7bdd172&oidc_iss=https://login.microsoftonline.com/788de26b-bf5a-46d5-bb58-f35ff7bdd172/v2.0&session=no_session";
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
    if(grant_value != "")
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
Somtoday.setLoginWindow = (som, loginWindow) => {
    som.loginWindow = loginWindow;
    loginWindow.addEventListener('beforeload', (e,c) =>{Somtoday.onSomtodayRedirect(som,e,c)});
}
Somtoday.onSomtodayRedirect = async (som, event, callback) => {
	if(event.url.startsWith("somtodayleerling://oauth:443/callback")){
		var linkCode = event.url.replace("somtodayleerling://oauth:443/callback?code=","").split("&")[0];
		som.loginWindow.close();
        await Somtoday.GetToken(som, "authorization_code", "", {
            "redirect_uri":"somtodayleerling://oauth/callback",
            "code_verifier":"t9b9-QCBB3hwdYa3UW2U2c9hhrhNzDdPww8Xp6wETWQ",
            "code":linkCode
        });
	}else
	    callback(event.url);
}