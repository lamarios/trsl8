package api

import (
	"errors"
	"github.com/lamarios/trsl8/dao"
	"github.com/lamarios/trsl8/utils"
	"log"
	"net/http"
)

type LoginForm struct {
	Email    string
	Password string
}

func SearchUserHandler(user dao.UserFull, w http.ResponseWriter, r *http.Request) {
	var search string
	FromJson(r.Body, &search)

	searchUser := dao.SearchUser(search)

	ToJson(searchUser, w)
}

//Creates the first user
func SignUp(w http.ResponseWriter, r *http.Request) {

	users := dao.GetAllUsers()

	var user dao.UserFull
	FromJson(r.Body, &user)

	if len(users) == 0 { // if we don't have users, we allow to create the first one
		user.Role = dao.ADMIN
	} else {
		user.Role = dao.CONTRIBUTOR
	}

	user.Password = utils.Hash(user.Password)
	log.Println(user.Password)

	_, err := dao.GetUserByEmail(user.Email)
	if err == nil {
		WebError(w, errors.New("Email already taken"), 500, "")
		return
	}

	newUser, err2 := dao.CreateUser(user)
	if err2 != nil {
		WebError(w, err2, 500, "")
	} else {
		newUser.Password = ""
		ToJson(newUser, w)

	}

}

func GetSelfHandler(user dao.UserFull, w http.ResponseWriter, r *http.Request) {
	ToJson(user.User, w)
}

func Login(w http.ResponseWriter, r *http.Request) {
	log.Print("Logging in")
	var form LoginForm
	FromJson(r.Body, &form)

	user, err := dao.GetUserByEmail(form.Email)
	if err != nil {
		WebError(w, err, 401, "Email/password combination incorrect")
		return
	}
	password := utils.Hash(form.Password)

	if user.Password != password {
		WebError(w, err, 401, "Email/password combination incorrect")
		return
	}

	token, err := Encode(&user)
	if err != nil {
		WebError(w, err, 500, "Error creating token")
		return
	}

	ToJson(token, w)
}
