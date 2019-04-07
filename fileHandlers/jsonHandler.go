package fileHandlers

import (
	"errors"
	"fmt"
	"github.com/Jeffail/gabs"
	"github.com/lamarios/trsl8/dao"
	"github.com/lamarios/trsl8/git"
	"io/ioutil"
	"path/filepath"
	"strings"
)

type JsonHandler struct{}

const ext = ".json"

func (j JsonHandler) GetStrings(project dao.Project, language string) (map[string]string, error) {
	content, e := GetFileContent(git.GetRepoRoot(project) + language + ext)
	if e != nil {
		return nil, e
	}

	jsonParsed, e := gabs.ParseJSON([]byte(content))
	if e != nil {
		return nil, e
	}

	children, e := jsonParsed.ChildrenMap()
	if e != nil {
		return nil, e
	}

	strings := make(map[string]string)
	for key, child := range children {
		//fmt.Printf("key: %v, value: %v\n", key, child.Data().(string))
		strings[key] = child.Data().(string)
	}

	return strings, nil
}

func (j JsonHandler) GetString(project dao.Project, language string, term string) (string, error) {
	content, e := GetFileContent(git.GetRepoRoot(project) + language + ext)
	if e != nil {
		return "", e
	}

	jsonParsed, e := gabs.ParseJSON([]byte(content))
	if e != nil {
		return "", e
	}

	children, e := jsonParsed.ChildrenMap()
	if e != nil {
		return "", e
	}

	var value string
	for key, child := range children {
		if key == term {
			value = child.Data().(string)
		}
		//fmt.Printf("key: %v, value: %v\n", key, child.Data().(string))
	}

	if len(value) == 0 {
		return "", errors.New("Term not found")
	}

	return value, nil

}

func (j JsonHandler) GetTerms(project dao.Project) ([]string, error) {
	content, e := GetFileContent(git.GetRepoRoot(project) + project.MainLanguage + ext)
	if e != nil {
		return nil, e
	}

	jsonParsed, e := gabs.ParseJSON([]byte(content))
	if e != nil {
		return nil, e
	}

	children, e := jsonParsed.ChildrenMap()
	if e != nil {
		return nil, e
	}

	var terms []string
	for key, _ := range children {
		//fmt.Printf("key: %v, value: %v\n", key, child.Data().(string))
		terms = append(terms, key)
	}

	return terms, nil
}

func (j JsonHandler) UpdateString(project dao.Project, language string, term string, value string) error {

	file := git.GetRepoRoot(project) + language + ext
	content, e := GetFileContent(file)
	if e != nil {
		return e
	}

	jsonParsed, e := gabs.ParseJSON([]byte(content))
	if e != nil {
		//we have an empty json
		jsonParsed = gabs.New()
	}

	jsonParsed.Set(value, term)

	err := ioutil.WriteFile(file, []byte(jsonParsed.StringIndent("", "  ")), 0644)

	return err
}
func (j JsonHandler) CreateNewLanguage(project dao.Project, languageCode string) (string, error) {
	jsonParsed := gabs.New()

	fileName := languageCode + ".json"
	file := git.GetRepoRoot(project) + "/" + fileName
	err := ioutil.WriteFile(file, []byte(jsonParsed.StringIndent("", "  ")), 0644)
	return fileName, err
}

func (j JsonHandler) UpdateTerm(project dao.Project, language string, new string, old string) error {
	return nil
}

func (j JsonHandler) GetLanguages(project dao.Project) ([]string, error) {
	dir := fmt.Sprint(project.ID)
	files, err := git.GetRepoFiles(dir)
	if err != nil {
		return nil, err
	}

	var languages []string

	for _, f := range files {

		language := strings.TrimSuffix(f, filepath.Ext(f))

		languages = append(languages, language)
	}

	return languages, nil

}
