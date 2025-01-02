async function getAdmin(){
    let accessToken = localStorage.getItem("accessToken")
    console.log(accessToken)
    const accessTokenExpTime = getTokenExpiration(accessToken)
    console.log(accessTokenExpTime);

    if(accessTokenExpTime){
        const currentTime = new Date()
        if(currentTime < accessTokenExpTime){
            console.log("Access token faol");
        }
        else{
            console.log("Access token vaqti chiqib ketti");
            accessToken = await refreshTokenFunction()
            console.log("New accessToken: ", accessToken);
        }
    }

    fetch("http://45.92.173.42:3030/api/admin/all", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        },
        mode:"cors"
    })
    .then ((response) => {
        if(response.ok){
            return response.json()
        } else{
            console.log("Request failed with status: " + response.status);
        }
    })
    .then((admin) => {
        console.log(admin.data)
        displayAdmin(admin.data)
    })
    .catch((error) => {
        console.error("Error: ", error);
    });

}

function displayAdmin(admins){
    const adminList = document.getElementById("author-list");
    admins.forEach((admin) => {
        const listItem = document.createElement("li")
        listItem.textContent = `${admin.name} ${admin.phone} - ${admin.email}`;
        adminList.appendChild(listItem);
    });
}

function getTokenExpiration(token) {
    const decodedToken = JSON.parse(atob(token.split(".") [1]));

    if(decodedToken.exp){
        return new Date(decodedToken.exp * 1000);
    }
    return null
}

async function refreshTokenFunction() {
    try {
        const response = await fetch("http://45.92.173.42:3030/api/admin/refresh", {
            method:"POST",
            headers: {
                "Content-Type" : "application/json"
            }
        });

        const data = await response.json()
        if(data.error && data.error == "jwt expired"){
            console.log("Refresh tokenni ham vaqti chiqib ketti");
            return window.location.replace("/login")
        }
        localStorage.setItem("accessToken", data.accessToken);
        return data.accessToken;
    }
    catch (error) {
        console.log("RefreshToken error: ",error);
        return window.location.replace("/login")
    }
}