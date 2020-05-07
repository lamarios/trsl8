package dao

type Project struct {
	ProjectLight
	Username   string
	Password   string
	PrivateKey string `sql:"type:text;"`
	PublicKey  string `sql:"type:text;"`
}

type ProjectLight struct {
	ID           uint `gorm:"primary_key"`
	GitUrl       string
	Name         string
	Ssh          bool
	MainLanguage string
	Owner        User
	OwnerID      uint
	Users        []ProjectUser `gorm:"foreignkey:ProjectId"`
	FileType     string
}

type ProjectUser struct {
	ID        uint `gorm:"primary_key"`
	UserId    uint
	ProjectId uint
	User      User `gorm:"foreignkey:UserId"`
}

func GetAllProjectsAvailable() []Project {
	var projects []Project
	DB.Model(&Project{}).Find(&projects)

	return projects
}

func GetAllProjects(user UserFull) []Project {

	var projects []Project

	DB.Select("DISTINCT(projects.id), projects.*").Preload("Users").Preload("Owner").Joins("LEFT JOIN project_users p ON projects.id = p.project_id").Where("owner_id = ?", user.ID).Or("p.user_id = ?", user.ID).Find(&projects)

	return projects
}

func GetProject(user UserFull, id uint) (Project, error) {

	var project Project

	DB.Preload("Owner").Preload("Users").Preload("Users.User").Joins("LEFT JOIN project_users p ON projects.id = p.project_id").Where("(owner_id = ? OR p.user_id = ?) AND projects.id = ?", user.ID, user.ID, id).First(&project)

	return project, nil
}

func GetProjectById(id uint) (Project, error) {

	var project Project

	DB.Preload("Owner").Preload("Users").Preload("Users.User").First(&project)

	return project, nil
}

func CreateProject(project *Project) *Project {

	DB.Create(&project)

	return project
}

func AddUserToProject(project Project, user UserFull) (Project, error) {

	projectUser := ProjectUser{}

	projectUser.User = user.User
	projectUser.ProjectId = project.ID

	DB.Create(&projectUser)

	return GetProjectById(project.ID)
}

func RemoveUserFromProject(project Project, user UserFull) (Project, error) {

	projectUser := ProjectUser{}

	DB.Where("user_id = ? AND project_id = ?", user.ID, project.ID).First(&projectUser)

	DB.Unscoped().Delete(&projectUser)

	return GetProjectById(project.ID)
}
