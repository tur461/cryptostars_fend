import { API_PATH } from "../constants/api"

function retrieveTokenList() {
    return new Promise((r, j) => {
        fetch(API_PATH.TOKEN_LIST)
        .then(res => res.json())
        .then(res => r(res))
        .catch(er => j(er));
    });
}

export {
    retrieveTokenList,
}