package api

import (
	"errors"
	"fmt"
	"github.com/gorilla/mux"
	"github.com/lamarios/trsl8/dao"
	"github.com/lamarios/trsl8/fileHandlers"
	"github.com/lamarios/trsl8/git"
	"github.com/lamarios/trsl8/utils"
	"github.com/rs/xid"
	"io/ioutil"
	"log"
	"math"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"time"
)

type UpdateString struct {
	Language string
	Term     string
	Value    string
}

type ProjectStatus struct {
}

type StringRequest struct {
	MissingOnly bool
	Filter      string
	Languages   []string
	Page        int
	PageSize    int
}

type StringResponse struct {
	Page         int
	Total        int
	PageSize     int
	Terms        []string
	Translations map[string]map[string]string
	Progress     map[string]int
}

var (
	projectPushMap = make(map[uint]xid.ID)
)

func GetProjectProgressHandler(user dao.UserFull, w http.ResponseWriter, r *http.Request) {
	project, err := GetProjectForUser(user, true, w, r)
	if err != nil {
		WebError(w, err, 500, "Couldn't get project")
		return
	}

	err = git.Pull(project)
	if err != nil {
		WebError(w, err, 500, "Couldn't pull lastest changes")
		return
	}

	handler := fileHandlers.GetHandler(project.FileType)

	terms, err := handler.GetTerms(project)
	if err != nil {
		WebError(w, err, 500, "Couldn't get the terms")
		return
	}

	languages, err := handler.GetLanguages(project)
	if err != nil {
		WebError(w, err, 500, "Couldn't get the languages")
		return
	}

	progress := make(map[string]int)
	for _, language := range languages {

		langStrings, err := handler.GetStrings(project, language)
		if err != nil {
			WebError(w, err, 500, "Couldn't get the translations")
			return
		}

		//counting total
		count := 0
		for _, s := range langStrings {
			if len(s) > 0 {
				count++
			}
		}
		termSize := len(terms)
		if termSize > 0 {
			progress[language] = count * 100 / len(terms)
		} else {
			progress[language] = 0
		}
	}

	ToJson(progress, w)

}
func GetProjectStringsHandler(user dao.UserFull, w http.ResponseWriter, r *http.Request) {
	project, err := GetProjectForUser(user, true, w, r)
	if err != nil {
		WebError(w, err, 500, "Couldn't get project")
		return
	}

	var request StringRequest
	FromJson(r.Body, &request)

	err = git.Pull(project)
	if err != nil {
		WebError(w, err, 500, "Couldn't pull lastest changes")
		return
	}

	handler := fileHandlers.GetHandler(project.FileType)

	terms, err := handler.GetTerms(project)
	if err != nil {
		WebError(w, err, 500, "Couldn't get the terms")
		return
	}

	sort.Strings(terms)

	var filteredTerms []string
	var allTranslations = make(map[string]map[string]string)
	var translations = make(map[string]map[string]string)
	var progress = make(map[string]int)

	// Getting all the translations and progress
	for _, language := range request.Languages {

		langStrings, err := handler.GetStrings(project, language)
		if err != nil {
			WebError(w, err, 500, "Couldn't get the translations")
			return
		}

		allTranslations[language] = langStrings

		//counting total
		count := 0
		for _, s := range langStrings {
			if len(s) > 0 {
				count++
			}
		}
		total := len(terms)
		if total == 0 {
			total = 1
		}
		progress[language] = count * 100 / total
	}

	// now getting based on each term
	request.Filter = strings.ToUpper(request.Filter)
	for _, term := range terms {

		tempTerm := strings.ToUpper(term)
		if strings.Contains(tempTerm, request.Filter) {

			termTrans := make(map[string]string)
			hasMissing := false

			for _, language := range request.Languages {

				str := allTranslations[language][term]
				if len(str) > 0 {
					termTrans[language] = str
				} else {
					hasMissing = true
				}
			}

			if hasMissing && request.MissingOnly || !request.MissingOnly {
				filteredTerms = append(filteredTerms, term)
				for language, str := range termTrans {
					if translations[language] == nil {
						translations[language] = make(map[string]string)
					}
					translations[language][term] = str
				}
			}

		}

	}

	total := len(filteredTerms)

	from := request.Page * request.PageSize
	termSize := len(filteredTerms)
	expectedStop := request.PageSize

	to := from + int(math.Min(float64(termSize), float64(expectedStop)))
	filteredTerms = filteredTerms[from:to]
	paginatedTerms := make([]string, 0)
	for _, t := range filteredTerms {
		if len(t) > 0 {
			paginatedTerms = append(paginatedTerms, t)
		}
	}

	filteredTerms = paginatedTerms
	response := StringResponse{
		Terms:        filteredTerms,
		Translations: translations,
		Progress:     progress,
		Page:         request.Page,
		PageSize:     request.PageSize,
		Total:        total,
	}

	ToJson(&response, w)

}

func GetProjectHandler(user dao.UserFull, w http.ResponseWriter, r *http.Request) {
	project, err := GetProjectForUser(user, true, w, r)
	if err != nil {
		WebError(w, err, 500, "Couldn't get project")
		return
	}

	ToJson(&project.ProjectLight, w)
}
func GetProjectLanguagesHandler(user dao.UserFull, w http.ResponseWriter, r *http.Request) {
	project, err := GetProjectForUser(user, true, w, r)
	if err != nil {
		WebError(w, err, 500, "Something went wrong when getting project")
		return
	}

	files, err := git.GetRepoFiles(fmt.Sprint(project.ID))
	if err != nil {
		WebError(w, err, 500, "Couldn't get project files")
		return
	}

	var languages []string
	for _, f := range files {
		language := strings.TrimSuffix(f, filepath.Ext(f))
		languages = append(languages, language)
	}

	ToJson(&languages, w)
}

func GetAllProjectsHandler(user dao.UserFull, w http.ResponseWriter, r *http.Request) {
	log.Print(user.ID)
	projects := dao.GetAllProjects(user)

	projectLight := make([]dao.ProjectLight, 0)

	for _, p := range projects {
		projectLight = append(projectLight, p.ProjectLight)
	}

	ToJson(projectLight, w)
}

func CreateProject(user dao.UserFull, w http.ResponseWriter, r *http.Request) {
	var project dao.Project

	FromJson(r.Body, &project)

	project.Owner = user.User
	project.OwnerID = user.ID

	if len(project.GitUrl) == 0 {
		WebError(w, errors.New("Project url empty"), 500, "")
		return
	}
	if len(project.Username) == 0 && len(project.Password) == 0 && !project.Ssh {
		WebError(w, errors.New("Email or password empty empty"), 500, "")
		return
	}

	if len(project.MainLanguage) == 0 {
		WebError(w, errors.New("Please select a main language"), 500, "")
		return
	}

	project.MainLanguage = strings.TrimSuffix(project.MainLanguage, filepath.Ext(project.MainLanguage))

	dao.CreateProject(&project)

	_, err := git.CloneRepo(project, fmt.Sprint(project.ID))
	if err != nil {
		if err.Error() == "remote repository is empty" {
			// we need to create the folder, init the repo, set upstream, create new file and commit the whole thing
			err = git.RepoFromScratch(project)
			if err != nil {
				WebError(w, errors.New("Couldn;t create repo from scratch"), 500, "")
				return
			}
		} else {
			WebError(w, errors.New("Couldn;t create repo from scratch"), 500, "")
			return
		}
	}

	// checking if main language is available, otherwise create it
	availableFiles, err := git.GetRepoFiles(fmt.Sprint(project.ID))
	if err != nil || availableFiles == nil {
		availableFiles = make([]string, 0)
	}

	languageAvailable := false
	for _, f := range availableFiles {

		language := strings.TrimSuffix(f, filepath.Ext(f))

		if language == project.MainLanguage {
			languageAvailable = true
		}
	}

	if !languageAvailable {
		handler := fileHandlers.GetHandler(project.FileType)

		newFileName, e := handler.CreateNewLanguage(project, project.MainLanguage)
		if e != nil {
			WebError(w, e, 500, "Error when creating new file")
			log.Print(e)
			return
		}

		e = git.AddFile(project, newFileName)
		if e != nil {
			WebError(w, e, 500, "Error when creating new file")
			log.Print(e)
			return
		}

		_, e = git.CommitChanges(project, "["+user.Email+"] add new language "+project.MainLanguage)
		if e != nil {
			WebError(w, e, 500, "Error when creating new file")
			log.Print(e)
			return
		}

		go pushProject(project)

	}

	ToJson(&project.ProjectLight, w)
}

func TestProjectHandler(user dao.UserFull, w http.ResponseWriter, r *http.Request) {
	var project dao.Project
	FromJson(r.Body, &project)

	log.Printf("Checkign repo %s", project.GitUrl)

	dir, err := ioutil.TempDir("", "trsl8-repo-test")
	dir = filepath.ToSlash(dir)
	log.Printf("Cloning in %s", dir)

	_, err = git.CloneRepo(project, dir)

	if err != nil && err.Error() != "remote repository is empty" {
		WebError(w, err, 500, "")
		return
	}

	availableFiles, err := git.GetRepoFiles(dir)
	if err != nil || availableFiles == nil {
		availableFiles = make([]string, 0)
	}

	ToJson(&availableFiles, w)

	os.RemoveAll(dir)
}

func GetProjectStatusHandler(user dao.UserFull, w http.ResponseWriter, r *http.Request) {

}

func UpdateStringHandler(user dao.UserFull, w http.ResponseWriter, r *http.Request) {
	project, err := GetProjectForUser(user, true, w, r)
	if err != nil {
		WebError(w, err, 500, "Something went wrong when getting project")
		return
	}

	var updateString UpdateString
	FromJson(r.Body, &updateString)

	handler := fileHandlers.GetHandler(project.FileType)

	// we pull changes before committing to be sure we have everything up to date, trying to avoid conflicts as much as possible
	err = git.Pull(project)
	if err != nil {
		WebError(w, err, 500, "Couldn't pull")
		return
	}

	err = handler.UpdateString(project, updateString.Language, updateString.Term, updateString.Value)
	if err != nil {
		WebError(w, err, 500, "Couldn't update file")
		return
	}

	commitChanges, err := git.CommitChanges(project, "["+user.Email+"] update "+updateString.Language+": "+updateString.Term+" -> "+updateString.Value)
	if err != nil {
		WebError(w, err, 500, "Couldn't commit changes")
		return
	}

	go pushProject(project)

	ToJson(commitChanges.String(), w)
}

func GetTermsHandler(user dao.UserFull, w http.ResponseWriter, r *http.Request) {
	project, e := GetProjectForUser(user, true, w, r)
	if e != nil {
		WebError(w, e, 500, "Something went wrong when getting project")
		return
	}

	err := git.Pull(project)
	if err != nil {
		WebError(w, err, 500, "Couldn't pull")
		return
	}

	handler := fileHandlers.GetHandler(project.FileType)
	terms, e := handler.GetTerms(project)
	if e != nil {
		WebError(w, e, 500, "Couldn't get terms")
		return
	}

	sort.Strings(terms)
	ToJson(terms, w)

}
func GetProjectForUser(user dao.UserFull, allowContributor bool, w http.ResponseWriter, r *http.Request) (dao.Project, error) {
	vars := mux.Vars(r)

	//getting project t osee if user can access
	projectId, err := strconv.ParseUint(vars["project"], 10, 32)
	if err != nil {
		return dao.Project{}, err
	}

	project, err := dao.GetProject(user, uint(projectId))
	if err != nil {
		return dao.Project{}, err
	}

	isOwner := project.OwnerID == user.ID
	if allowContributor {
		isContributor := false
		for _, contribution := range project.Users {
			if contribution.UserId == user.ID {
				isContributor = true
			}
		}

		if !isOwner && !isContributor {
			return dao.Project{}, errors.New("Not owner nor contributor")
		}

	} else {
		if !isOwner {
			return dao.Project{}, errors.New("Not the owner of the project")
		}
	}

	return project, nil
}

func NewLanguageHandler(user dao.UserFull, w http.ResponseWriter, r *http.Request) {
	var languageCode string
	FromJson(r.Body, &languageCode)

	project, e := GetProjectForUser(user, false, w, r)
	if e != nil {
		WebError(w, e, 500, "Something went wrong when getting project")
		log.Print(e)
		return
	}

	handler := fileHandlers.GetHandler(project.FileType)

	newFileName, e := handler.CreateNewLanguage(project, languageCode)
	if e != nil {
		WebError(w, e, 500, "Error when creating new file")
		log.Print(e)
		return
	}

	e = git.AddFile(project, newFileName)
	if e != nil {
		WebError(w, e, 500, "Error when creating new file")
		log.Print(e)
		return
	}

	commit, e := git.CommitChanges(project, "["+user.Email+"] add new language "+languageCode)
	if e != nil {
		WebError(w, e, 500, "Error when creating new file")
		log.Print(e)
		return
	}

	go pushProject(project)

	ToJson(commit.String(), w)
}

func NewTermHandler(user dao.UserFull, w http.ResponseWriter, r *http.Request) {
	project, e := GetProjectForUser(user, true, w, r)
	if e != nil {
		WebError(w, e, 500, "Something went wrong when getting project")
		log.Print(e)
		return
	}

	var term string
	FromJson(r.Body, &term)

	// we pull changes before committing to be sure we have everything up to date, trying to avoid conflicts as much as possible
	// we pull changes before committing to be sure we have everything up to date, trying to avoid conflicts as much as possible
	err := git.Pull(project)
	if err != nil {
		WebError(w, err, 500, "Couldn't commit")
		return
	}

	var updateString UpdateString
	FromJson(r.Body, &updateString)

	handler := fileHandlers.GetHandler(project.FileType)

	// checking if term already exists
	_, err = handler.GetString(project, project.MainLanguage, term)
	if err == nil {
		error := errors.New("Term already exists")
		WebError(w, error, 500, "")
		return
	}

	handler.UpdateString(project, project.MainLanguage, term, "")

	commitChanges, err := git.CommitChanges(project, "["+user.Email+"] update "+project.MainLanguage+": new term "+term)
	if err != nil {
		WebError(w, err, 500, "Couldn't commit")
		return
	}

	go pushProject(project)

	ToJson(commitChanges.String(), w)
}

func AddUserToProjectHandler(user dao.UserFull, w http.ResponseWriter, r *http.Request) {
	project, err := GetProjectForUser(user, false, w, r)
	if err != nil {
		WebError(w, err, 500, "")
		return
	}

	vars := mux.Vars(r)

	userId, err := utils.StringToUint(vars["user"])
	if err != nil {
		WebError(w, err, 500, "")
		return
	}

	userFull, err := dao.GetUserById(userId)
	if err != nil {
		WebError(w, err, 500, "")
		return
	}

	updatedProject, err := dao.AddUserToProject(project, userFull)
	if err != nil {
		WebError(w, err, 500, "")
		return
	}

	ToJson(updatedProject, w)

}

func RemoveUserFromProjectHandler(user dao.UserFull, w http.ResponseWriter, r *http.Request) {
	project, err := GetProjectForUser(user, false, w, r)
	if err != nil {
		WebError(w, err, 500, "")
		return
	}

	vars := mux.Vars(r)

	userId, err := utils.StringToUint(vars["user"])
	if err != nil {
		WebError(w, err, 500, "")
		return
	}

	userFull, err := dao.GetUserById(userId)
	if err != nil {
		WebError(w, err, 500, "")
		return
	}

	updatedProject, err := dao.RemoveUserFromProject(project, userFull)
	if err != nil {
		WebError(w, err, 500, "")
		return
	}

	ToJson(updatedProject, w)

}

func pushProject(project dao.Project) {
	id := xid.New()
	projectPushMap[project.ID] = id

	time.Sleep(10 * time.Second)

	if projectPushMap[project.ID] == id {
		delete(projectPushMap, project.ID)
		log.Print("Pushing repo: ", project.ID)
		err := git.Push(project)
		if err == nil {
			log.Print("Done pushing ", project.ID)
		} else {
			log.Printf("error while pushing %s", err)
		}
	} else {
		log.Print("Project ", project.ID, ": Another push is coming later, skipping")
	}
}
