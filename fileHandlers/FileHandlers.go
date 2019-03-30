package fileHandlers

import (
	"io/ioutil"
)

type fileHandler interface {
	GetStrings(fileLocaltion string) (map[string]string, error)
	GetString(fileLocaltion string, term string) (string, error)
	GetTerms(fileLocation string) ([]string, error)
	UpdateString(fileLocation string, term string, value string) error
	CreateNewLanguage(repoRoot string, languageCode string) (string, error)
}

func GetHandler(fileType string) fileHandler {
	switch fileType {
	case "json":
		return JsonHandler{}
	}

	return nil
}

func GetFileContent(path string) (string, error) {
	dat, err := ioutil.ReadFile(path)
	if err != nil {
		return "", err
	}

	return string(dat), nil
}
