package fileHandlers

import (
	"errors"
	"github.com/Jeffail/gabs"
	"io/ioutil"
)

type JsonHandler struct{}

func (j JsonHandler) GetStrings(fileLocation string) (map[string]string, error) {
	content, e := GetFileContent(fileLocation)
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

func (j JsonHandler) GetString(fileLocation string, term string) (string, error) {
	content, e := GetFileContent(fileLocation)
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

func (j JsonHandler) GetTerms(fileLocation string) ([]string, error) {
	content, e := GetFileContent(fileLocation)
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

func (j JsonHandler) UpdateString(fileLocation string, term string, value string) error {

	content, e := GetFileContent(fileLocation)
	if e != nil {
		return e
	}

	jsonParsed, e := gabs.ParseJSON([]byte(content))
	if e != nil {
		//we have an empty json
		jsonParsed = gabs.New()
	}

	jsonParsed.Set(value, term)

	err := ioutil.WriteFile(fileLocation, []byte(jsonParsed.StringIndent("", "  ")), 0644)

	return err
}
func (j JsonHandler) CreateNewLanguage(repoRoot string, languageCode string) (string, error) {
	jsonParsed := gabs.New()

	fileName := languageCode + ".json"
	file := repoRoot + "/" + fileName
	err := ioutil.WriteFile(file, []byte(jsonParsed.StringIndent("", "  ")), 0644)
	return fileName, err
}
