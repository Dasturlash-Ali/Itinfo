async function getAuthors() {
    let accessToken = localStorage.getItem("accessToken");
    console.log("accessToken:", accessToken);
    const accessTokenExpTime = getTokenExpiration(accessToken);
    console.log("accessTokenExpTime:", accessTokenExpTime);

    if(accessTokenExpTime){
        const currentTime = new Date()
        if(currentTime < accessTokenExpTime) {
            console.log("Access token faol");
        } else{
            console.log("Access token vaqti chiqib ketti");
            accessToken = await refreshTokenFunction()
            console.log("NewAccessToken:", accessToken);
        }
    }

    fetch("http://localhost:3030/api/author/all", {
        method: "GET",

        headers:{
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        },
        mode: "cors"
    })
        .then((res) => {
            if(response.ok) {
                return res.json()
            }else{
                console.log("Request failed with status: " + response.status);
            }
        })
        .then((author) => {
            console.log(author.data);
            displayAuthor(author.data)
        })
        .catch((error) => {
            console.error("Error:", error);
        });
}

function displayAuthor(authors){
    const authorList = document.getElementById("author-list");
    authors.forEach((author) => {
        const listItem = document.createElement("li")
        listItem.textContent = `${author.author_first_name} ${author.author_last_name} - ${author.email}`;
        authorList.appendChild(listItem);
    });
}

function getTokenExpiration(token){
    const decodeToken = JSON.parse(atob(token.split(".")[1]));
    if(decodeToken.exp){
        return new Date(decodeToken.exp * 1000);
    }
    return null
}

async function refreshTokenFunction() {
    try {
        const response = await fetch("http://localhost:3030/api/author/refresh", {
            method: "POST",
            headers: {
                "Content-Type": "apllication/json"
            }
        });
        
        const  data = await response.json();
        if(data.error && data.error == "jwt expired"){
            console.log("Refresh tokenni ham vaqti chiqib ketti");
            return window.location.replace("/login")
        }
        localStorage.setItem("accessToken", data.accessToken)
        return data.accessToken;
        
    } catch (error) {
        console.log("RefrshToken:", error);
        return window.location.replace("/login")
    }
}