package api

import (
	"errors"
	"fmt"
	"github.com/gorilla/mux"
	"github.com/lamarios/translator/dao"
	"github.com/lamarios/translator/fileHandlers"
	"github.com/lamarios/translator/git"
	"github.com/lamarios/translator/utils"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
)

type UpdateString struct {
	Language string
	Term     string
	Value    string
}

type ProjectStatus struct {
}

func GetProjectStringsHandler(user dao.UserFull, w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)

	//getting project t osee if user can access
	projectId, err := strconv.ParseUint(vars["project"], 10, 32)
	if err != nil {
		WebError(w, err, 500, "Couldn't parse project Id")
		return
	}

	project, err := dao.GetProject(user, uint(projectId))
	if err != nil {
		WebError(w, err, 500, "Couldn't get project")
		return
	}

	if project.OwnerID != user.ID {
		WebError(w, err, 401, "Not allowed to see this repo")
		return
	}

	err = git.Pull(project)
	if err != nil {
		WebError(w, err, 500, "Couldn't pull lastest changes")
		return
	}

	dir := vars["project"]
	files, err := git.GetRepoFiles(dir)
	if err != nil {
		WebError(w, err, 500, "Couldn't get project files")
		return
	}

	fileContent := make(map[string]string)

	fileHandler := fileHandlers.GetHandler(project.FileType)

	language1 := vars["language"]

	for _, f := range files {

		language := strings.TrimSuffix(f, filepath.Ext(f))

		if language == language1 {
			content, err := fileHandler.GetStrings(git.CloneRoot + "/" + dir + "/" + f)
			if err == nil {
				// probably empty file
				fileContent = content
			} else {
				fileContent = make(map[string]string)
			}
		}
	}

	ToJson(&fileContent, w)

}

func GetProjectHandler(user dao.UserFull, w http.ResponseWriter, r *http.Request) {
	project, err := GetProjectForUser(user, true, w, r)
	if err != nil {
		WebError(w, err, 500, "Couldn't get project")
		return
	}

	ToJson(&project, w)
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
	ToJson(dao.GetAllProjects(user), w)
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

	git.CloneRepo(project, fmt.Sprint(project.ID))

	ToJson(&project, w)
}

func TestProjectHandler(user dao.UserFull, w http.ResponseWriter, r *http.Request) {
	var project dao.Project
	FromJson(r.Body, &project)

	log.Printf("Checkign repo %s", project.GitUrl)

	dir, err := ioutil.TempDir("", "translator-repo-test")
	log.Printf("Cloning in %d", dir)

	_, err = git.CloneRepo(project, dir)

	if err != nil {
		WebError(w, err, 500, "Couldn't clone repository")
		return
	}

	availableFiles, err := git.GetRepoFiles(dir)
	if err != nil {
		WebError(w, err, 500, "Couldn't get repo files")
		return
	}

	ToJson(&availableFiles, w)

	os.RemoveAll(dir)
}

func GetProjectStatusHandler(user dao.UserFull, w http.ResponseWriter, r *http.Request) {

}

func UpdateTermHandler(user dao.UserFull, w http.ResponseWriter, r *http.Request) {
	project, e := GetProjectForUser(user, true, w, r)
	if e != nil {
		WebError(w, e, 500, "Something went wrong when getting project")
		return
	}

	var file string
	files, err := git.GetRepoFiles(fmt.Sprint(project.ID))
	if err != nil {
		WebError(w, err, 500, "Couldn't get project files")
		log.Print(err)
		return
	}

	var updateString UpdateString
	FromJson(r.Body, &updateString)

	for _, f := range files {
		if updateString.Language+"."+project.FileType == f {
			file = git.CloneRoot + "/" + fmt.Sprint(project.ID) + "/" + f
		}
	}

	fmt.Print(file)
	handler := fileHandlers.GetHandler(project.FileType)

	// we pull changes before committing to be sure we have everything up to date, trying to avoid conflicts as much as possible
	err = git.Pull(project)
	if err != nil {
		WebError(w, err, 500, "Couldn't pull")
		return
	}

	err = handler.UpdateString(file, updateString.Term, updateString.Value)
	if err != nil {
		WebError(w, err, 500, "Couldn't update file")
		return
	}

	commitChanges, err := git.CommitChanges(project, "["+user.Email+"] update "+updateString.Language+": "+updateString.Term+" -> "+updateString.Value)
	if err != nil {
		WebError(w, err, 500, "Couldn't commit changes")
		return
	}

	err = git.Push(project)
	if err != nil {
		WebError(w, err, 500, "Couldn't push")
		return
	}

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
	terms, e := handler.GetTerms(git.GetRepoRoot(project) + "/" + project.MainLanguage + "." + project.FileType)
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

	root := git.GetRepoRoot(project)
	handler := fileHandlers.GetHandler(project.FileType)

	newFileName, e := handler.CreateNewLanguage(root, languageCode)
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

	git.Push(project)

	ToJson(commit.String(), w)
}

func NewTermHandler(user dao.UserFull, w http.ResponseWriter, r *http.Request) {
	project, e := GetProjectForUser(user, false, w, r)
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

	//getting main language file
	var file string
	files, err := git.GetRepoFiles(fmt.Sprint(project.ID))
	if err != nil {
		WebError(w, err, 500, "Couldn't get project files")
		log.Print(err)
		return
	}

	var updateString UpdateString
	FromJson(r.Body, &updateString)

	for _, f := range files {
		if project.MainLanguage+"."+project.FileType == f {
			file = git.CloneRoot + "/" + fmt.Sprint(project.ID) + "/" + f
		}
	}

	handler := fileHandlers.GetHandler(project.FileType)

	// checking if term already exists
	existingValue, err := handler.GetString(file, term)
	if err == nil {
		WebError(w, err, 500, "Term already exists with value "+existingValue)
		return
	}

	handler.UpdateString(file, term, "")

	commitChanges, err := git.CommitChanges(project, "["+user.Email+"] update "+project.MainLanguage+": new term "+term)
	if err != nil {
		WebError(w, err, 500, "Couldn't commit")
		return
	}

	git.Push(project)

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
