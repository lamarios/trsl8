package dao

import (
	"errors"
)

type UserRole int

const (
	ADMIN       UserRole = 1
	CONTRIBUTOR UserRole = 0
)

type UserFull struct {
	User
	Email    string
	Password string
	Role     UserRole
}

type User struct {
	ID        uint `gorm:"primary_key"`
	FirstName string
	LastName  string
}

func (User) TableName() string {
	return "users"
}

// Gets all the users
func GetAllUsers() []UserFull {

	var users []UserFull
	DB.Find(&users)

	return users
}

func CreateUser(user UserFull) (UserFull, error) {

	DB.Create(&user)

	return user, nil
}

func GetUserByEmail(email string) (UserFull, error) {

	var user UserFull
	DB.First(&user, "email = ?", email)

	if user != (UserFull{}) {
		return user, nil
	} else {
		return UserFull{}, errors.New("Email doesn't exist")
	}
}

func GetUserById(id uint) (UserFull, error) {

	var user UserFull
	DB.First(&user, "id = ?", id)
	if user != (UserFull{}) {
		return user, nil
	} else {
		return UserFull{}, errors.New("Email doesn't exist")
	}
}

func SearchUser(search string) []User {

	search = "%" + search + "%"
	var users []User
	DB.Where("first_name LIKE ? OR last_name LIKE ? OR email LIKE ?", search, search, search).Find(&users)

	return users
}
