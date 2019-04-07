package utils

import (
	"crypto/md5"
	"encoding/hex"
	"os"
	"strconv"
)

func Hash(s string) string {
	hash := md5.Sum([]byte(s))
	return hex.EncodeToString(hash[:])
}

func StringToUint(string string) (uint, error) {
	myInt, err := strconv.ParseUint(string, 10, 32)
	if err != nil {
		return 0, err
	}

	return uint(myInt), nil
}

func GetEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}
