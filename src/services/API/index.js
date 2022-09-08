import { API_PATH } from "../constants/api"
import { MISC } from "../constants/common";
import { jObject, jString } from "../utils";

function retrieveTokenList() {
    return new Promise((r, j) => {
        fetch(API_PATH.TOKEN_LIST)
        .then(res => res.json())
        .then(res => r(jObject(res.data)))
        .catch(er => j(er));
    });
}

function retrieveProjectVersion() {
    return new Promise((r, j) => {
        fetch(API_PATH.PROJECT_VERSION, {
            method: 'POST',
            body: jString({
                projectId: MISC.PROJECT_ID,
            })
        })
        .then(res => res.json())
        .then(res => r(res.data))
        .catch(er => j(er));
    });
}

export {
    retrieveTokenList,
    retrieveProjectVersion,
}