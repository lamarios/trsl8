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
	db := GetConnection()
	defer db.Close()

	var users []UserFull
	db.Find(&users)

	return users
}

func CreateUser(user UserFull) (UserFull, error) {

	db := GetConnection()
	defer db.Close()

	db.Create(&user)

	return user, nil
}

func GetUserByEmail(email string) (UserFull, error) {
	db := GetConnection()
	defer db.Close()

	var user UserFull
	db.First(&user, "email = ?", email)

	if user != (UserFull{}) {
		return user, nil
	} else {
		return UserFull{}, errors.New("Email doesn't exist")
	}
}

func GetUserById(id uint) (UserFull, error) {
	db := GetConnection()
	defer db.Close()

	var user UserFull
	db.First(&user, "id = ?", id)
	if user != (UserFull{}) {
		return user, nil
	} else {
		return UserFull{}, errors.New("Email doesn't exist")
	}
}

func SearchUser(search string) []User {
	db := GetConnection()
	defer db.Close()

	search = "%" + search + "%"
	var users []User
	db.Where("first_name LIKE ? OR last_name LIKE ? OR username LIKE ?", search, search, search).Find(&users)

	return users
}
