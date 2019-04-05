package api

import (
	"encoding/json"
	"fmt"
	"github.com/gorilla/mux"
	"github.com/lamarios/translator/dao"
	"io"
	"io/ioutil"
	"log"
	"net/http"
)

func DefineEndPoints(r *mux.Router) {
	r.HandleFunc("/", ServeIndexHandler)
	r.HandleFunc("/sign-in", ServeIndexHandler)
	r.HandleFunc("/sign-up", ServeIndexHandler)
	r.HandleFunc("/projects/{id}", ServeIndexHandler)
	r.HandleFunc("/projects", ServeIndexHandler)

	r.HandleFunc("/login-submit", Login).Methods("POST")

	r.HandleFunc("/api/users", SignUp).Methods("POST")
	r.HandleFunc("/api/users/self", CheckAuth(GetSelfHandler)).Methods("GET")
	r.HandleFunc("/api/users/search", CheckAuth(SearchUserHandler)).Methods("POST")

	r.HandleFunc("/api/ssh-keys", CheckAuth(CreateSshKeyHandler)).Methods("POST")

	r.HandleFunc("/api/projects", CheckAuth(GetAllProjectsHandler)).Methods("GET")
	r.HandleFunc("/api/projects", CheckAuth(CreateProject)).Methods("POST")
	r.HandleFunc("/api/projects/test", CheckAuth(TestProjectHandler)).Methods("POST")
	r.HandleFunc("/api/projects/{project}", CheckAuth(GetProjectHandler)).Methods("GET")
	r.HandleFunc("/api/projects/{project}/terms", CheckAuth(GetTermsHandler)).Methods("GET")
	r.HandleFunc("/api/projects/{project}/terms", CheckAuth(NewTermHandler)).Methods("POST")
	r.HandleFunc("/api/projects/{project}/languages", CheckAuth(GetProjectLanguagesHandler)).Methods("GET")
	r.HandleFunc("/api/projects/{project}/languages", CheckAuth(NewLanguageHandler)).Methods("POST")
	r.HandleFunc("/api/projects/{project}/strings/{language}", CheckAuth(GetProjectStringsHandler)).Methods("GET")
	r.HandleFunc("/api/projects/{project}/strings", CheckAuth(UpdateStringHandler)).Methods("POST")
	r.HandleFunc("/api/projects/{project}/status", CheckAuth(GetProjectStatusHandler)).Methods("GET")
	r.HandleFunc("/api/projects/{project}/users/{user}", CheckAuth(AddUserToProjectHandler)).Methods("POST")
	r.HandleFunc("/api/projects/{project}/users/{user}", CheckAuth(RemoveUserFromProjectHandler)).Methods("DELETE")
}

func WebError(w http.ResponseWriter, err error, status int, customMessage string) {
	if err != nil {
		w.WriteHeader(status)
		if len(customMessage) > 0 {
			ToJson(customMessage, w)
		} else {
			ToJson(err.Error(), w)
		}
		log.Print(err.Error())
	}
}

func ToJson(obj interface{}, w http.ResponseWriter) (string, error) {
	b, err := json.Marshal(obj)
	if err != nil {
		return "", err
	}

	w.Header().Add("Content-type", "application/json")
	fmt.Fprintf(w, string(b))
	return string(b), nil
}

func FromJson(jsonString io.Reader, obj interface{}) {
	decoder := json.NewDecoder(jsonString)
	err := decoder.Decode(&obj)
	if err != nil {
		return
	}
}

func CheckAuth(h func(user dao.UserFull, w http.ResponseWriter, r *http.Request)) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		log.Printf("%s -> %s", r.Method, r.RequestURI)

		token := r.Header.Get("Authorization")

		if len(token) == 0 {
			http.Error(w, "No token provided", 401)
			return
		}

		claim, err := Decode(token)
		if err != nil {
			http.Error(w, err.Error(), 401)
			return
		}

		user, err := dao.GetUserById(claim.Data.User.ID)

		if user == (dao.UserFull{}) {
			http.Error(w, "Invalid token", 401)
			return
		}

		h(user, w, r)
	}
}

func ServeIndexHandler(w http.ResponseWriter, r *http.Request) {
	dat, err := ioutil.ReadFile("static/index.html")
	if err != nil {
		WebError(w, err, 500, "")
	} else {
		fmt.Fprintf(w, string(dat))
	}
}
