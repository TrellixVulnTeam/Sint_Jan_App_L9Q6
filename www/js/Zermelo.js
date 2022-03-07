var Zermelo = {};
Zermelo.baseEndpoint = "https://sint-janscollege.zportal.nl/api/v3/"; // endpoint for all other requests
Zermelo.CheckAccessToken = async (zermObj) => {//check if access_token or refresh_token has expierd
    if (!(new Date().getTime() < zermObj.access_token_expire_time)) {//if normal token if exipiered
        throw "Error: No valid token.";
    } else//if none have expiered return token
        return zermObj.access_token;
}
Zermelo.GetToken = async (zermObj, code) => {//get token via refresh or password grand type
    var result = await post(Zermelo.baseEndpoint + "oauth/token", { "grant_type": "authorization_code", "code": code }, { "Content-Type": "application/x-www-form-urlencoded" });
    zermObj.access_token = result.access_token;
    await Zermelo.GetTokenData(zermObj, result.access_token);
    return result.access_token;
}
Zermelo.GetTokenData = async (zermObj, code) => {
    var result = await get(Zermelo.baseEndpoint + "tokens/~current?access_token=" + code, { "Content-Type": "application/x-www-form-urlencoded" });
    zermObj.access_token_expire_time = result.response.data[0].expires * 1000;
    zermObj.username = result.response.data[0].user;
}
Zermelo.GetStudent = async (zermObj) => {//gets user data
    var result = await get(Zermelo.baseEndpoint + "users?access_token=" + zermObj.access_token + "&code=" + zermObj.username + "&fields=lastName,code,prefix,firstName", { "Content-Type": "application/x-www-form-urlencoded" });
    zermObj.firstname = result.response.data[0].firstName
    zermObj.lastname = result.response.data[0].lastName
    return zermObj;
}
Zermelo.GetScedule = async (zermObj, year, week) => {//gets the scedule between two dates
    var result = await get(Zermelo.baseEndpoint + "liveschedule?access_token=" + zermObj.access_token + "&student=" + zermObj.username + "&week="+year+pad(week,2), { "Content-Type": "application/x-www-form-urlencoded" });
    return result.response.data[0].appointments;
}