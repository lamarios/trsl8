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
	if err != nil {
		panic("failed to connect database")
	}
	//db.LogMode(true)
	return db
}
