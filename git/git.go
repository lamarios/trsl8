package git

import (
	"fmt"
	"github.com/lamarios/trsl8/dao"
	"golang.org/x/crypto/ssh"
	"gopkg.in/src-d/go-git.v4"
	config2 "gopkg.in/src-d/go-git.v4/config"
	"gopkg.in/src-d/go-git.v4/plumbing"
	"gopkg.in/src-d/go-git.v4/plumbing/object"
	"gopkg.in/src-d/go-git.v4/plumbing/transport/http"
	gitssh "gopkg.in/src-d/go-git.v4/plumbing/transport/ssh"
	"io/ioutil"
	"log"
	"net"
	"os"
	"strings"
	"time"
)

type Commit struct {
	Type    string `json:"type"`
	Date    string `json:"date"`
	Author  string `json:"author"`
	Message string `json:"message"`
	Commit  string `json:"commit"`
}

const (
	CloneRoot = "./repos"
)

var RefreshProjects = true

func acceptAllHosts(hostname string, remote net.Addr, key ssh.PublicKey) error {
	return nil
}

func CloneRepo(project dao.Project, dir string) (*git.Repository, error) {
	os.MkdirAll(CloneRoot, os.ModePerm)
	dir = CloneRoot + "/" + dir
	log.Printf("Cloning in %d", dir)

	options := &git.CloneOptions{
		URL: project.GitUrl,
	}

	if !project.Ssh {
		options.Auth = &http.BasicAuth{
			Username: project.Username,
			Password: project.Password,
		}
	} else {
		signer, _ := ssh.ParsePrivateKey([]byte(project.PrivateKey))

		var helper = gitssh.HostKeyCallbackHelper{
			HostKeyCallback: acceptAllHosts,
		}

		options.Auth = &gitssh.PublicKeys{User: "git", Signer: signer, HostKeyCallbackHelper: helper}
		//options.Auth = &gitssh.PublicKeys{User: "git", Signer: signer}
	}

	return git.PlainClone(dir, false, options)
}

func RepoFromScratch(project dao.Project) error {
	dir := GetRepoRoot(project)
	err := os.MkdirAll(dir, os.ModePerm)

	if err != nil {
		return err
	}

	newFile := project.MainLanguage + "." + project.FileType
	err = ioutil.WriteFile(dir+newFile, []byte("{}"), 0644)
	if err != nil {
		return err
	}

	repository, err := git.PlainInit(dir, false)
	if err != nil {
		return err
	}

	var config = config2.RemoteConfig{
		Name: "origin",
		URLs: []string{project.GitUrl},
	}

	_, err = repository.CreateRemote(&config)
	if err != nil {
		return err
	}

	err = AddFile(project, newFile)
	if err != nil {
		return err
	}

	_, err = CommitChanges(project, "create main language file")
	if err != nil {
		return err
	}

	err = Push(project)
	if err != nil {
		return err
	}

	return nil
}

func GetRepoFiles(dir string) ([]string, error) {
	files, err := ioutil.ReadDir(CloneRoot + "/" + dir)
	if err != nil {
		return nil, err
	}

	var availableFiles []string
	for _, f := range files {
		if !strings.HasPrefix(f.Name(), ".") {
			availableFiles = append(availableFiles, f.Name())
		}
	}

	return availableFiles, nil
}

func GetRepoRoot(project dao.Project) string {
	return CloneRoot + "/" + fmt.Sprint(project.ID) + "/"
}

func Pull(project dao.Project) error {
	directory := GetRepoRoot(project)

	options := git.PullOptions{}
	options.RemoteName = "origin"

	if !project.Ssh {
		options.Auth = &http.BasicAuth{
			Username: project.Username,
			Password: project.Password,
		}
	} else {
		signer, _ := ssh.ParsePrivateKey([]byte(project.PrivateKey))

		var helper = gitssh.HostKeyCallbackHelper{
			HostKeyCallback: acceptAllHosts,
		}

		options.Auth = &gitssh.PublicKeys{User: "git", Signer: signer, HostKeyCallbackHelper: helper}
		//options.Auth = &gitssh.PublicKeys{User: "git", Signer: signer}

	}
	// Opens an already existing repository.
	r, err := git.PlainOpen(directory)
	if err != nil {
		return err
	}

	w, err := r.Worktree()
	if err != nil {
		return err
	}

	err = w.Pull(&options)
	// up to date is not an error for us
	if err != nil && (err.Error() == "already up-to-date" || err.Error() == "non-fast-forward update") {
		return nil
	}
	return err

}

func CommitChanges(project dao.Project, message string) (plumbing.Hash, error) {
	directory := GetRepoRoot(project)

	// Opens an already existing repository.
	r, err := git.PlainOpen(directory)
	if err != nil {
		return plumbing.Hash{}, err
	}

	w, err := r.Worktree()
	if err != nil {
		return plumbing.Hash{}, err
	}

	commit, err := w.Commit(message, &git.CommitOptions{
		All: true,
		Author: &object.Signature{
			Name:  "Translation",
			Email: "paul@logit.global",
			When:  time.Now(),
		},
	})

	if err != nil {
		return plumbing.Hash{}, err
	}

	return commit, nil

}

func AddFile(project dao.Project, fileName string) error {
	directory := GetRepoRoot(project)
	// Opens an already existing repository.
	r, err := git.PlainOpen(directory)
	if err != nil {
		return err
	}

	w, err := r.Worktree()
	if err != nil {
		return err
	}

	_, err = w.Add(fileName)
	return err

}

func Push(project dao.Project) error {

	r, err := git.PlainOpen(GetRepoRoot(project))
	if err != nil {
		return err
	}
	options := git.PushOptions{}
	if !project.Ssh {
		options.Auth = &http.BasicAuth{
			Username: project.Username,
			Password: project.Password,
		}
	} else {
		signer, _ := ssh.ParsePrivateKey([]byte(project.PrivateKey))

		var helper = gitssh.HostKeyCallbackHelper{
			HostKeyCallback: acceptAllHosts,
		}

		options.Auth = &gitssh.PublicKeys{User: "git", Signer: signer, HostKeyCallbackHelper: helper}
		//options.Auth = &gitssh.PublicKeys{User: "git", Signer: signer}
	}
	// push using default options
	err = r.Push(&options)
	if err != nil && err.Error() == "already up-to-date" {
		return nil
	}

	return err
}

func StopProjectRefresh() {
	RefreshProjects = false
}

func PullPushAllProjectsLoop() {
	for RefreshProjects {
		projects := dao.GetAllProjectsAvailable()

		for _, project := range projects {
			log.Printf("updating project %d", project.ID)
			err := Pull(project)
			if err != nil {
				log.Printf("Error while pulling project %d", project.ID)
			}
			err = Push(project)
			if err != nil {
				log.Printf("Error while pushing project %d", project.ID)
			}
		}

		time.Sleep(1 * time.Minute)

	}
}

func GetRepoHistory(project dao.Project, page int, pageSize int) ([]Commit, error) {
	r, err := git.PlainOpen(GetRepoRoot(project))
	if err != nil {
		return nil, err
	}

	ref, err := r.Head()
	if err != nil {
		return nil, err
	}

	// ... retrieves the commit history
	cIter, err := r.Log(&git.LogOptions{From: ref.Hash(), All: true})
	if err != nil {
		return nil, err
	}

	commits := make([]Commit, 0)
	// ... just iterates over the commits, printing it

	i := 0
	from := page * pageSize
	to := from + pageSize
	err = cIter.ForEach(func(c *object.Commit) error {
		if i >= from && i < to {
			fmt.Println(c)
			commit := Commit{
				Type:    plumbing.CommitObject.String(),
				Commit:  c.Hash.String(),
				Author:  c.Author.String(),
				Date:    c.Author.When.Format("Mon Jan 02 15:04:05 2006 -0700"),
				Message: c.Message,
			}

			if len(commit.Type) > 0 || len(commit.Commit) > 0 || len(commit.Author) > 0 || len(commit.Date) > 0 || len(commit.Message) > 0 {
				commits = append(commits, commit)
				i++
			}
		} else {
			i++
		}
		return nil
	})

	if err != nil {
		return nil, err
	}

	return commits, nil

}
