import {sprintf} from "sprintf-js";

const ROOT = process.env.API_ROOT || "https://trsl8.com";
console.log("ROOT", ROOT);
const ENDPOINTS = {
    USERS: {
        LOGIN: ROOT + "/login-submit"
    },
    API: {
        USERS: {
            SIGN_UP: ROOT + "/api/users",
            SEARCH: ROOT + "/api/users/search",
            SELF: ROOT + "/api/users/self",
        },
        PROJECTS: {
            GET_ALL: ROOT + "/api/projects",
            GET_PROGRESS: ROOT + "/api/projects/%s/progress",
            TEST: ROOT + "/api/projects/test",
            GET: ROOT + "/api/projects/{id}",
            GET_STRINGS: ROOT + "/api/projects/%s/strings/all",
            UPDATE_STRINGS: ROOT + "/api/projects/%s/strings",
            CREATE_TERM: ROOT + "/api/projects/{id}/terms",
            GET_TERM: ROOT + "/api/projects/%s/terms",
            CREATE_LANGUAGE: ROOT + "/api/projects/{id}/languages",
            GET_LANGUAGES: ROOT + "/api/projects/%s/languages",
            USERS: {
                ADD: ROOT + "/api/projects/{id}/users/{userId}",
            }
        },
        SSH: {
            GENERATE_KEYS: ROOT + "/api/ssh-keys"
        }
    }

};


export default class Service {

    /**
     * Save the first user
     * @param user
     * @return {Promise<any | never>}
     */
    signUp(user) {
        return fetch(ENDPOINTS.API.USERS.SIGN_UP, {
            method: "POST", // or "PUT"
            body: JSON.stringify(user), // data can be `string` or {object}!
            headers: {
                "Content-Type": "application/json"
            }
        }).then(this.getJsonNoLoginRedirect);
    }

    /**
     * Logs in a user
     * @param user
     * @return {Promise<any | never>}
     */
    login(user) {
        return fetch(ENDPOINTS.USERS.LOGIN, {
            method: "POST", // or "PUT"
            body: JSON.stringify(user), // data can be `string` or {object}!
            headers: {
                "Content-Type": "application/json"
            }
        }).then(this.getJsonNoLoginRedirect);
    }

    getSelf() {
        return fetch(ENDPOINTS.API.USERS.SELF, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": this.checkLocalStorage()
            }
        }).then(this.getJsonNoLoginRedirect);
    }

    checkLocalStorage() {
        let token = window.localStorage.getItem("token");
        if (token === null || this.tokenExpired(token)) {
            window.localStorage.removeItem("token");
            window.location.href = "/login";
        }


        return token;
    }

    tokenExpired(jwtToken) {
        var tokenPayload = this.parseJwt(jwtToken);
        var now = Math.floor(Date.now() / 1000);

        return tokenPayload.exp < now;
    }

    /**
     * Lists all projects
     * @return {Promise<Response | never>}
     */
    getProjects() {
        return fetch(ENDPOINTS.API.PROJECTS.GET_ALL, {
            headers: {
                "Authorization": this.checkLocalStorage()
            }
        }).then(this.getJson.bind(this));
    }

    /**
     * Get progress of languages for a project
     * @return {Promise<Response | never>}
     */
    getProjectProgress(id) {
        return fetch(sprintf(ENDPOINTS.API.PROJECTS.GET_PROGRESS, id), {
            headers: {
                "Authorization": this.checkLocalStorage()
            }
        }).then(this.getJson.bind(this));
    }

    /**
     * Gets a single project
     * @param id
     * @return {Promise<Response | never>}
     */
    getProject(id) {
        return fetch(ENDPOINTS.API.PROJECTS.GET.replace("{id}", id), {
            headers: {
                "Authorization": this.checkLocalStorage()
            }
        }).then(this.getJson.bind(this));
    }

    /**
     * Gets a project files
     * @param id
     * @return {Promise<Response | never>}
     */
    getProjectStrings(id, request) {
        return fetch(sprintf(ENDPOINTS.API.PROJECTS.GET_STRINGS, id), {
            method: "POST", // or "PUT"
            body: JSON.stringify(request), // data can be `string` or {object}!
            headers: {
                "Authorization": this.checkLocalStorage()
            }
        }).then(this.getJson.bind(this));
    }

    /**
     * Creates a new project
     * @return {Promise<Response>}
     */
    createProject(project) {
        return fetch(ENDPOINTS.API.PROJECTS.GET_ALL, {
            method: "POST", // or "PUT"
            body: JSON.stringify(project), // data can be `string` or {object}!
            headers: {
                "Content-Type": "application/json",
                "Authorization": this.checkLocalStorage()
            }
        }).then(this.getJson.bind(this));
    }

    /**
     * Tests whether the git settings are valid
     * @param params
     * @return {Promise<any | never>}
     */
    testProject(params) {

        return fetch(ENDPOINTS.API.PROJECTS.TEST, {
            method: "POST", // or "PUT"
            body: JSON.stringify(params), // data can be `string` or {object}!
            headers: {
                "Content-Type": "application/json",
                "Authorization": this.checkLocalStorage()
            }
        }).then(this.getJson.bind(this));
    }

    /**
     * Updates a single string for a single language
     * @param string the update string
     * @return {Promise<Response | never>}
     */
    updateString(id, string) {
        return fetch(sprintf(ENDPOINTS.API.PROJECTS.UPDATE_STRINGS, id), {
            method: "POST", // or "PUT"
            body: JSON.stringify(string), // data can be `string` or {object}!
            headers: {
                "Authorization": this.checkLocalStorage()
            }
        }).then(this.getJson.bind(this));
    }

    /**
     * get project terms
     * @param id
     * @return {Promise<Response | never>}
     */
    getProjectTerms(id) {
        return fetch(sprintf(ENDPOINTS.API.PROJECTS.GET_TERM, id), {
            headers: {
                "Authorization": this.checkLocalStorage()
            }
        }).then(this.getJson.bind(this));
    }

    /**
     * Creates a new term
     * @param id
     * @return {Promise<Response | never>}
     */
    createTerm(id, term) {
        return fetch(ENDPOINTS.API.PROJECTS.CREATE_TERM.replace("{id}", id), {
            method: "POST", // or "PUT"
            body: JSON.stringify(term), // data can be `string` or {object}!
            headers: {
                "Authorization": this.checkLocalStorage()
            }
        }).then(this.getJson.bind(this));
    }

    /**
     * Creates a new  language
     * @param id
     * @param term
     * @return {Promise<Response | never>}
     */
    getLanguages(id) {
        return fetch(sprintf(ENDPOINTS.API.PROJECTS.GET_LANGUAGES, id), {
            headers: {
                "Authorization": this.checkLocalStorage()
            }
        }).then(this.getJson.bind(this));
    }

    /**
     * Creates a new  language
     * @param id
     * @param term
     * @return {Promise<Response | never>}
     */
    createLanguage(id, languageCode) {
        return fetch(ENDPOINTS.API.PROJECTS.CREATE_LANGUAGE.replace("{id}", id), {
            method: "POST", // or "PUT"
            body: JSON.stringify(languageCode), // data can be `string` or {object}!
            headers: {
                "Authorization": this.checkLocalStorage()
            }
        }).then(this.getJson.bind(this));
    }

    /**
     * Generate private and public key for repo add
     * @return {Promise<Response | never>}
     */
    generateSshKeys() {
        return fetch(ENDPOINTS.API.SSH.GENERATE_KEYS, {
            method: "POST", // or "PUT"
            headers: {
                "Authorization": this.checkLocalStorage()
            }
        }).then(this.getJson.bind(this));
    }

    /**
     * Searches for users
     * @param search
     * @return {Promise<Response | never>}
     */
    searchUser(search) {
        return fetch(ENDPOINTS.API.USERS.SEARCH, {
            method: "POST", // or "PUT"
            body: JSON.stringify(search),
            headers: {
                "Authorization": this.checkLocalStorage()
            }
        }).then(this.getJson.bind(this));
    }


    /**
     * Adds a user to a project
     * @param projectId
     * @param userId
     * @return {Promise<Response | never>}
     */
    addUserToProject(projectId, userId) {
        return fetch(ENDPOINTS.API.PROJECTS.USERS.ADD.replace("{id}", projectId).replace("{userId}", userId), {
            method: "POST", // or "PUT"
            headers: {
                "Authorization": this.checkLocalStorage()
            }
        }).then(this.getJson.bind(this));
    }

    removeUserFromProject(projectId, userId) {
        return fetch(ENDPOINTS.API.PROJECTS.USERS.ADD.replace("{id}", projectId).replace("{userId}", userId), {
            method: "DELETE", // or "PUT"
            headers: {
                "Authorization": this.checkLocalStorage()
            }
        }).then(this.getJson.bind(this));
    }

    getJsonNoLoginRedirect(res) {
        if (res.status === 200) {
            return res.json();
        } else {
            throw res.json();
        }
    }

    getJson(res) {
        if (res.status === 401) {
            window.location.href = "/sign-in";
        }
        return this.getJsonNoLoginRedirect(res);
    }

    getUserData() {
        const token = window.localStorage.getItem("token");
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        return JSON.parse(window.atob(base64)).Data.User;
    }

    parseJwt(token) {
        var base64Url = token.split(".")[1];
        var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        var jsonPayload = decodeURIComponent(atob(base64).split("").map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(""));

        return JSON.parse(jsonPayload);
    };
}

export const service = new Service();
