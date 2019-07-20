package fileHandlers

import (
	"github.com/lamarios/trsl8/dao"
	"io/ioutil"
)

type FileHandler interface {
	GetStrings(project dao.Project, language string) (map[string]string, error)
	GetString(project dao.Project, language string, term string) (string, error)
	GetTerms(project dao.Project) ([]string, error)
	UpdateTerm(project dao.Project, language string, old string, new string) error
	UpdateString(project dao.Project, language string, term string, value string) error
	CreateNewLanguage(project dao.Project, languageCode string) (string, error)
	GetLanguages(project dao.Project) ([]string, error)
}

func GetHandler(fileType string) FileHandler {
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
