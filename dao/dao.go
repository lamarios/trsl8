package dao

import (
	"github.com/jinzhu/gorm"
)

func SetUp() {
	db := GetConnection()
	defer db.Close()

	db.AutoMigrate(&UserFull{})
	db.AutoMigrate(&Setting{})
	db.AutoMigrate(&Project{})
	db.AutoMigrate(&ProjectUser{})
}

func GetConnection() *gorm.DB {
	db, err := gorm.Open("sqlite3", "translator.db")
	//db.LogMode(true)
	if err != nil {
		panic("failed to connect database")
	}
	return db
}
