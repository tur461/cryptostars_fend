import { API_PATH } from "../constants/api"
import { jObject } from "../utils";

function retrieveTokenList() {
    return new Promise((r, j) => {
        fetch(API_PATH.TOKEN_LIST)
        .then(res => res.json())
        .then(res => r(jObject(res.data)))
        .catch(er => j(er));
    });
}

export {
    retrieveTokenList,
}