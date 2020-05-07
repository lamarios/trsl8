package dao

import (
	_ "github.com/go-sql-driver/mysql"
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/mysql"
	_ "github.com/jinzhu/gorm/dialects/sqlite"
	"github.com/lamarios/trsl8/utils"
)

type DBConfig struct {
	Type         string
	Url          string
	DatabaseName string
	Username     string
	Password     string
	Options      string
}

var config = DBConfig{
	Type:         utils.GetEnv("DB_TYPE", "sqlite3"),
	Url:          utils.GetEnv("DB_URL", "trsl8.db"),
	DatabaseName: utils.GetEnv("DB_NAME", ""),
	Username:     utils.GetEnv("DB_USERNAME", ""),
	Password:     utils.GetEnv("DB_PASSWORD", ""),
	Options:      utils.GetEnv("DB_OPTIONS", "?charset=utf8&parseTime=True&loc=Local"),
}

var DB *gorm.DB

func SetUp() {
	db := GetConnection()
	defer db.Close()

	db.AutoMigrate(&UserFull{})
	db.AutoMigrate(&Setting{})
	db.AutoMigrate(&Project{})
	db.AutoMigrate(&ProjectUser{})
}

func GetConnection() *gorm.DB {

	var arguments string
	switch config.Type {
	case "sqlite3":
		arguments = config.Url
	case "mysql":
		arguments = config.Username + ":" + config.Password + "@tcp(" + config.Url + ")/" + config.DatabaseName + config.Options
	}

	db, err := gorm.Open(config.Type, arguments)
	if err != nil {
		panic(err)
	}
	//db.LogMode(true)
	return db
}
