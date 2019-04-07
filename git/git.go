package git

import (
	"fmt"
	"github.com/lamarios/trsl8/dao"
	"golang.org/x/crypto/ssh"
	"gopkg.in/src-d/go-git.v4"
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

const (
	CloneRoot = "./repos"
)

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
