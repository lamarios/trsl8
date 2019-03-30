package dao

import (
	"github.com/jinzhu/gorm"
)

type Setting struct {
	gorm.Model
	Key   string
	Value string
}
